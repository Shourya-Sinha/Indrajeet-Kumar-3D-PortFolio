import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

export type DbDriverMode = "mongodb" | "local";

interface GlobalDbState {
  mongoosePromise: Promise<typeof mongoose> | null;
  activeMode: DbDriverMode | null;
  seeded: boolean;
}

const globalForDb = globalThis as unknown as { __portfolioDbState?: GlobalDbState };
if (!globalForDb.__portfolioDbState) {
  globalForDb.__portfolioDbState = {
    mongoosePromise: null,
    activeMode: null,
    seeded: false,
  };
}

export function getLocalDbDir(): string {
  const configured = process.env.LOCAL_DB_DIR;
  return configured ? path.resolve(configured) : path.resolve(process.cwd(), "storage", "db");
}

export async function ensureDbConnected(): Promise<DbDriverMode> {
  const state = globalForDb.__portfolioDbState!;
  if (state.activeMode === "mongodb" && mongoose.connection.readyState === 1) {
    return "mongodb";
  }

  const uri = process.env.MONGODB_URI?.trim();
  const mode = (process.env.DB_MODE || "auto").toLowerCase();

  if (uri && mode !== "local") {
    try {
      if (!state.mongoosePromise) {
        state.mongoosePromise = mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          bufferCommands: false,
        });
      }
      await state.mongoosePromise;
      state.activeMode = "mongodb";
      return "mongodb";
    } catch (err) {
      state.mongoosePromise = null;
      if (mode === "mongodb") {
        throw err;
      }
      console.warn("[db] MongoDB connection unavailable, falling back to schema-validated local store.");
    }
  }

  const dir = getLocalDbDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  state.activeMode = "local";
  return "local";
}

export function getDbState(): GlobalDbState {
  return globalForDb.__portfolioDbState!;
}
