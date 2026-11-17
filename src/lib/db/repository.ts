import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Query } from "mingo";
import type { CollectionMap, CollectionName } from "./types";
import { ensureDbConnected, getLocalDbDir } from "./connection";
import { getMongooseModel, SchemaRegistry } from "./models";

const collectionLocks = new Map<string, Promise<unknown>>();

function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = collectionLocks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  collectionLocks.set(key, next.catch(() => undefined));
  return next;
}

function getCollectionFile(name: CollectionName): string {
  return path.join(getLocalDbDir(), `${name}.json`);
}

function readLocalCollection<K extends CollectionName>(name: K): CollectionMap[K][] {
  const file = getCollectionFile(name);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf8").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CollectionMap[K][]) : [];
  } catch {
    return [];
  }
}

function writeLocalCollection<K extends CollectionName>(name: K, docs: CollectionMap[K][]): void {
  const dir = getLocalDbDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = getCollectionFile(name);
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(docs, null, 2), "utf8");
  fs.renameSync(tmp, file);
}

function validateAgainstSchema<K extends CollectionName>(
  name: K,
  doc: Record<string, unknown>
): Record<string, unknown> {
  const Model = getMongooseModel(name);
  const instance = new Model(doc);
  const err = instance.validateSync();
  if (err) {
    throw new Error(`Validation failed for ${name}: ${err.message}`);
  }
  const plain = instance.toObject({ depopulate: true }) as Record<string, unknown>;
  return JSON.parse(JSON.stringify(plain)) as Record<string, unknown>;
}

function checkUniqueConstraints<K extends CollectionName>(
  name: K,
  docs: CollectionMap[K][],
  candidate: Record<string, unknown>,
  excludeId?: string
): void {
  const schema = SchemaRegistry[name];
  const uniquePaths: string[] = [];
  schema.eachPath((pathname, schemaType) => {
    const opts = (schemaType as unknown as { options?: { unique?: boolean } }).options;
    if (opts?.unique) uniquePaths.push(pathname);
  });

  for (const field of uniquePaths) {
    const val = candidate[field];
    if (val === undefined || val === null) continue;
    const conflict = docs.find(
      (d) =>
        d._id !== excludeId &&
        String((d as unknown as Record<string, unknown>)[field] ?? "") === String(val)
    );
    if (conflict) {
      throw new Error(`Duplicate unique value for ${name}.${field}: ${String(val)}`);
    }
  }
}

export interface FindOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
}

function sortDocs<T extends Record<string, unknown>>(docs: T[], sort?: Record<string, 1 | -1>): T[] {
  if (!sort) return docs;
  const entries = Object.entries(sort);
  if (entries.length === 0) return docs;
  return [...docs].sort((a, b) => {
    for (const [key, dir] of entries) {
      const av = a[key];
      const bv = b[key];
      if (av === bv) continue;
      if (av === undefined || av === null) return dir === 1 ? -1 : 1;
      if (bv === undefined || bv === null) return dir === 1 ? 1 : -1;
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * dir;
      }
      return String(av).localeCompare(String(bv)) * dir;
    }
    return 0;
  });
}

function serializeMongoDoc<T>(doc: unknown): T {
  const plain = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
  if (plain._id && typeof plain._id === "object") {
    plain._id = String(plain._id);
  }
  return plain as T;
}

export async function findMany<K extends CollectionName>(
  name: K,
  filter: Record<string, unknown> = {},
  options: FindOptions = {}
): Promise<CollectionMap[K][]> {
  const mode = await ensureDbConnected();
  if (mode === "mongodb") {
    const Model = getMongooseModel(name);
    let q = Model.find(filter);
    if (options.sort) q = q.sort(options.sort);
    if (options.skip) q = q.skip(options.skip);
    if (options.limit) q = q.limit(options.limit);
    const rows = await q.lean().exec();
    return rows.map((r) => serializeMongoDoc<CollectionMap[K]>(r));
  }

  return withLock(name, async () => {
    const docs = readLocalCollection(name);
    const query = new Query(filter);
    let matched = docs.filter((d) => query.test(d as unknown as Record<string, unknown>));
    matched = sortDocs(matched as unknown as Record<string, unknown>[], options.sort) as unknown as CollectionMap[K][];
    if (options.skip) matched = matched.slice(options.skip);
    if (options.limit) matched = matched.slice(0, options.limit);
    return structuredClone(matched);
  });
}

export async function findOne<K extends CollectionName>(
  name: K,
  filter: Record<string, unknown>
): Promise<CollectionMap[K] | null> {
  const rows = await findMany(name, filter, { limit: 1 });
  return rows[0] ?? null;
}

export async function countDocs<K extends CollectionName>(
  name: K,
  filter: Record<string, unknown> = {}
): Promise<number> {
  const mode = await ensureDbConnected();
  if (mode === "mongodb") {
    const Model = getMongooseModel(name);
    return Model.countDocuments(filter).exec();
  }
  const rows = await findMany(name, filter);
  return rows.length;
}

export async function createOne<K extends CollectionName>(
  name: K,
  data: Omit<CollectionMap[K], "_id" | "createdAt" | "updatedAt"> & { _id?: string }
): Promise<CollectionMap[K]> {
  const mode = await ensureDbConnected();
  if (mode === "mongodb") {
    const Model = getMongooseModel(name);
    const created = await Model.create(data);
    return serializeMongoDoc<CollectionMap[K]>(created.toObject());
  }

  return withLock(name, async () => {
    const docs = readLocalCollection(name);
    const now = new Date().toISOString();
    const id = data._id || crypto.randomBytes(12).toString("hex");
    const candidate = validateAgainstSchema(name, {
      ...(data as Record<string, unknown>),
      _id: id,
    });
    candidate._id = id;
    candidate.createdAt = now;
    candidate.updatedAt = now;
    checkUniqueConstraints(name, docs, candidate);
    docs.push(candidate as unknown as CollectionMap[K]);
    writeLocalCollection(name, docs);
    return structuredClone(candidate as unknown as CollectionMap[K]);
  });
}

export async function updateById<K extends CollectionName>(
  name: K,
  id: string,
  patch: Partial<Omit<CollectionMap[K], "_id" | "createdAt">>
): Promise<CollectionMap[K] | null> {
  const mode = await ensureDbConnected();
  if (mode === "mongodb") {
    const Model = getMongooseModel(name);
    const updated = await Model.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true, runValidators: true }
    )
      .lean()
      .exec();
    return updated ? serializeMongoDoc<CollectionMap[K]>(updated) : null;
  }

  return withLock(name, async () => {
    const docs = readLocalCollection(name);
    const idx = docs.findIndex((d) => String(d._id) === String(id));
    if (idx === -1) return null;
    const existing = docs[idx] as unknown as Record<string, unknown>;
    const merged = {
      ...existing,
      ...(patch as Record<string, unknown>),
      _id: existing._id,
    };
    const validated = validateAgainstSchema(name, merged);
    validated._id = existing._id;
    validated.createdAt = existing.createdAt;
    validated.updatedAt = new Date().toISOString();
    checkUniqueConstraints(name, docs, validated, String(id));
    docs[idx] = validated as unknown as CollectionMap[K];
    writeLocalCollection(name, docs);
    return structuredClone(docs[idx]);
  });
}

export async function deleteById<K extends CollectionName>(
  name: K,
  id: string
): Promise<boolean> {
  const mode = await ensureDbConnected();
  if (mode === "mongodb") {
    const Model = getMongooseModel(name);
    const res = await Model.findByIdAndDelete(id).exec();
    return Boolean(res);
  }

  return withLock(name, async () => {
    const docs = readLocalCollection(name);
    const next = docs.filter((d) => String(d._id) !== String(id));
    if (next.length === docs.length) return false;
    writeLocalCollection(name, next);
    return true;
  });
}

export async function upsertOne<K extends CollectionName>(
  name: K,
  filter: Record<string, unknown>,
  data: Omit<CollectionMap[K], "_id" | "createdAt" | "updatedAt">
): Promise<CollectionMap[K]> {
  const existing = await findOne(name, filter);
  if (existing) {
    const updated = await updateById(
      name,
      existing._id,
      data as Partial<Omit<CollectionMap[K], "_id" | "createdAt">>
    );
    return updated!;
  }
  return createOne(name, data);
}

export async function bulkReorder<K extends CollectionName>(
  name: K,
  orderedIds: string[]
): Promise<void> {
  for (let i = 0; i < orderedIds.length; i += 1) {
    await updateById(name, orderedIds[i], { order: i + 1 } as unknown as Partial<
      Omit<CollectionMap[K], "_id" | "createdAt">
    >);
  }
}
