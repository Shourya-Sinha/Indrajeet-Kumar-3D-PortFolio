"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  Bot,
  Cpu,
  GitBranch,
  Lock,
  Search,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const AttackGraph3DCanvas = dynamic(
  () => import("@/components/three/AttackGraph3DCanvas").then((m) => m.AttackGraph3DCanvas),
  { ssr: false }
);

const TABS = [
  { key: "graph", label: "1. Attack Graph", icon: GitBranch },
  { key: "dijkstra", label: "2. Critical Path", icon: Activity },
  { key: "engines", label: "3. 121 Engines", icon: Cpu },
  { key: "risk", label: "4. FAIR Risk (4000x)", icon: ShieldAlert },
  { key: "bot", label: "5. Autonomous BOT", icon: Bot },
  { key: "hunt", label: "6. Threat Hunting", icon: Search },
  { key: "zerotrust", label: "7. Zero-Trust Policies", icon: Lock },
  { key: "remediation", label: "8. Auto-Remediation", icon: Wrench },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const ENGINE_GROUPS = [
  { name: "Reconnaissance", count: 10, sample: ["Tech Fingerprint", "Subdomain Enum", "Deep DNS", "CT Log Miner", "CDN Mapper", "Asset Discovery+"] },
  { name: "Network Security", count: 16, sample: ["Service Detect", "Deep TLS Audit", "WAF Detect", "Topology Mapper", "HSTS Preload", "HTTP/2 Probe"] },
  { name: "Web Exploits", count: 26, sample: ["XSS Analyzer", "SQLi Probe", "SSRF Guard", "CORS Deep", "Proto Pollution", "IDOR Audit"] },
  { name: "API & Cloud", count: 14, sample: ["OpenAPI Validator", "GraphQL Deep", "Cloud Posture", "K8s CIS", "IAM Analyzer", "WebSocket Fuzz"] },
  { name: "Secrets & Crypto", count: 10, sample: ["Git Secrets", "JWT Weakness", "Session Entropy", "Cookie Audit", "Weak Cipher Check", "Key Exposure"] },
  { name: "Supply Chain", count: 9, sample: ["SBOM Generator", "SAST Lite", "Dependency Confusion", "Typo-Squat", "CI/CD Hardening", "Helm Audit"] },
  { name: "Threat Intel & Compliance", count: 36, sample: ["CVE/KEV Match", "MITRE Mapping", "OWASP ASVS", "FAIR Risk Model", "Dijkstra Path", "20 Auto-Fix Engines"] },
];

export function AttackPathInteractiveSuite() {
  const [activeTab, setActiveTab] = useState<TabKey>("graph");
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    ENGINE_GROUPS.map((g) => g.name)
  );
  const [highlightCritical, setHighlightCritical] = useState(true);
  const [botInterval, setBotInterval] = useState<"5m" | "15m" | "60m" | "cron">("15m");
  const [selectedRemedy, setSelectedRemedy] = useState(0);

  const selectedEngineTotal = useMemo(
    () =>
      ENGINE_GROUPS.filter((g) => selectedGroups.includes(g.name)).reduce(
        (acc, g) => acc + g.count,
        0
      ),
    [selectedGroups]
  );

  const toggleGroup = (name: string) => {
    setSelectedGroups((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const remedies = [
    {
      title: "Fix #04: Harden JWT Verification & Enforce Strict RBAC Scope",
      target: "Auth Service -> Privileged Admin Role",
      patch: `// Before: accepts unverified alg or wide role claim
const payload = jwt.decode(token);

// Auto-Fix Patch: enforce HS256/RS256 + issuer + scoped role
const payload = jwt.verify(token, process.env.JWT_PUBLIC_KEY, {
  algorithms: ["RS256"],
  issuer: "auth.internal",
  audience: "core-api",
});
if (!payload.scopes?.includes("admin:write")) throw new ForbiddenError();`,
      verifyCurl: `curl -i -H "Authorization: Bearer <low_priv_token>" https://sandbox.local/api/admin/audit`,
    },
    {
      title: "Fix #11: Nginx Strict Transport & Security Headers Hardening",
      target: "API Gateway Edge Layer",
      patch: `add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; frame-ancestors 'none';" always;
add_header X-Content-Type-Options "nosniff" always;
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;`,
      verifyCurl: `curl -I https://sandbox.local/api/health`,
    },
    {
      title: "Fix #18: Block Lateral Metadata SSRF & Enforce Egress Allowlist",
      target: "Internal Cluster -> Crown Jewel Database",
      patch: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-lateral-db-access
spec:
  podSelector:
    matchLabels:
      tier: crown-jewel-db
  ingress:
    - from:
        - podSelector:
            matchLabels:
              role: verified-api-worker`,
      verifyCurl: `kubectl describe networkpolicy deny-lateral-db-access`,
    },
  ];

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-8 border border-cyan-400/20">
      {/* Scope & Authenticity Notice */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-xs text-amber-200 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5 sm:items-center">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300 sm:mt-0" />
          <span>
            <strong>Authorized Research Demonstration:</strong> Simulated architectural preview of v2.5 capabilities. Intended strictly for authorized self-assessment and controlled defensive lab topologies.
          </span>
        </div>
        <div className="flex shrink-0 gap-2 text-[11px]">
          <span className="rounded-full border border-emerald-400/35 bg-emerald-400/10 px-2.5 py-0.5 text-emerald-300">
            Implemented v2.5
          </span>
          <span className="rounded-full border border-violet-400/35 bg-violet-400/10 px-2.5 py-0.5 text-violet-300">
            Experimental AI/PR Sync
          </span>
        </div>
      </div>

      {/* 8 Interactive Demo Selector Pills */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-start gap-1.5 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition ${
                active
                  ? "border-cyan-400/60 bg-cyan-400/15 text-white shadow-[0_0_20px_rgba(0,229,255,0.18)]"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-slate-400"}`} />
              <span className="line-clamp-1">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Demo Viewport */}
      <div className="rounded-2xl border border-white/10 bg-[#07090e] p-4 sm:p-6">
        {activeTab === "graph" && (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
                  Interactive 3D Attack Topology (Internet → App → Crown Jewel DB)
                </span>
                <button
                  type="button"
                  onClick={() => setHighlightCritical((v) => !v)}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200 hover:border-cyan-400/40"
                >
                  {highlightCritical ? "Show All Edges" : "Highlight Critical Path"}
                </button>
              </div>
              <div className="h-[320px] w-full overflow-hidden rounded-xl border border-white/10 bg-void">
                <AttackGraph3DCanvas highlightCritical={highlightCritical} />
              </div>
            </div>
            <div className="flex flex-col justify-between space-y-4 lg:col-span-5">
              <div>
                <h4 className="font-display text-lg font-bold text-white">
                  Weighted Graph Centrality & Choke Points
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Raw findings from 121 engines are correlated into weighted directional edges representing reachability, credential reuse, and lateral movement potential.
                </p>
              </div>
              <div className="space-y-2.5 text-xs">
                {[
                  { node: "External Internet → API Gateway", centrality: "0.84 Betweenness", risk: "Entry" },
                  { node: "JWT / Auth Service (Choke Point)", centrality: "0.91 PageRank", risk: "Critical Bridge" },
                  { node: "Privileged Admin Role → Crown Jewel DB", centrality: "0.96 Exposure", risk: "Target" },
                ].map((row) => (
                  <div
                    key={row.node}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5"
                  >
                    <div>
                      <div className="font-semibold text-slate-100">{row.node}</div>
                      <div className="text-slate-400">{row.centrality}</div>
                    </div>
                    <span className="rounded-full border border-cyan-400/35 bg-cyan-400/10 px-2.5 py-0.5 text-cyan-300">
                      {row.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "dijkstra" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-display text-lg font-bold text-white">
                Dijkstra Critical Path Traversal (Simulated Topology)
              </h4>
              <span className="rounded-full border border-cyan-400/35 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                4 Hops · Cumulative Friction Weight: 1.42
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              {[
                { step: "HOP 01", name: "Public Internet", metric: "External Exposure", color: "border-cyan-400/40" },
                { step: "HOP 02", name: "API Gateway", metric: "CORS / Rate-Limit Probe", color: "border-sky-400/40" },
                { step: "HOP 03", name: "Auth Service", metric: "JWT Scope Escalation", color: "border-violet-400/40" },
                { step: "HOP 04", name: "Admin IAM Role", metric: "Lateral Pivot Vector", color: "border-amber-400/40" },
                { step: "TARGET", name: "Crown Jewel DB", metric: "Sensitive Data Store", color: "border-rose-400/45" },
              ].map((hop) => (
                <div
                  key={hop.step}
                  className={`rounded-xl border ${hop.color} bg-white/[0.03] p-4`}
                >
                  <div className="font-mono text-[11px] font-bold text-cyan-300">{hop.step}</div>
                  <div className="mt-1 font-semibold text-white">{hop.name}</div>
                  <div className="mt-1 text-xs text-slate-400">{hop.metric}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Breaking the single highest-centrality edge at <strong>Auth Service</strong> disconnects 3 downstream lateral paths simultaneously.
            </p>
          </div>
        )}

        {activeTab === "engines" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-lg font-bold text-white">
                  121 Selectable Scanning & Analysis Engines
                </h4>
                <p className="text-xs text-slate-400">
                  Toggle categories below to configure a scoped authorized assessment profile.
                </p>
              </div>
              <div className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 font-mono text-sm font-bold text-cyan-200">
                Active Engines: {selectedEngineTotal} / 121
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ENGINE_GROUPS.map((g) => {
                const enabled = selectedGroups.includes(g.name);
                return (
                  <button
                    key={g.name}
                    type="button"
                    onClick={() => toggleGroup(g.name)}
                    className={`rounded-xl border p-4 text-left transition ${
                      enabled
                        ? "border-cyan-400/45 bg-cyan-400/[0.07]"
                        : "border-white/10 bg-white/[0.02] opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{g.name}</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-xs text-cyan-300">
                        {g.count} engines
                      </span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {g.sample.map((s) => (
                        <span
                          key={s}
                          className="rounded-md border border-white/10 bg-black/30 px-2 py-0.5 text-[11px] text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "risk" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-display text-lg font-bold text-white">
                  FAIR Risk Quantification + 4,000-Iteration Monte Carlo Simulation
                </h4>
                <p className="text-xs text-slate-400">
                  Illustrative scenario model translating technical graph exposure into executive loss-exceedance percentiles.
                </p>
              </div>
              <span className="rounded-full border border-violet-400/35 bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
                4,000 Iterations · Sample Lab Scenario
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs text-slate-400">Simulated SLE (Most Likely)</div>
                <div className="mt-1 font-display text-2xl font-bold text-cyan-300">Model Driven</div>
                <div className="mt-1 text-xs text-slate-500">Asset Value × Vulnerability Factor</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs text-slate-400">Monte Carlo Percentiles</div>
                <div className="mt-1 font-display text-2xl font-bold text-white">P50 / P90 / P95</div>
                <div className="mt-1 text-xs text-slate-500">PERT-beta loss distribution curve</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs text-slate-400">Observability Export</div>
                <div className="mt-1 font-display text-2xl font-bold text-emerald-300">Prometheus + SQLite</div>
                <div className="mt-1 text-xs text-slate-500">Persistent historical trend tracking</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-300">
                Simulated Loss-Exceedance Histogram (Relative Path Weight)
              </div>
              <div className="flex h-24 items-end gap-1.5 rounded-xl border border-white/10 bg-black/40 p-3">
                {[18, 29, 44, 68, 92, 100, 84, 63, 47, 31, 22, 15, 9, 5].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`flex-1 rounded-t-sm ${
                      i >= 9 ? "bg-rose-400/75" : i >= 5 ? "bg-violet-400/75" : "bg-cyan-400/75"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "bot" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-display text-lg font-bold text-white">
                Autonomous BOT Scheduled Scanner & WebSocket Telemetry
              </h4>
              <div className="flex gap-1.5">
                {(["5m", "15m", "60m", "cron"] as const).map((cadence) => (
                  <button
                    key={cadence}
                    type="button"
                    onClick={() => setBotInterval(cadence)}
                    className={`rounded-lg border px-3 py-1 font-mono text-xs ${
                      botInterval === cadence
                        ? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
                        : "border-white/10 bg-white/5 text-slate-400"
                    }`}
                  >
                    {cadence}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-xs leading-relaxed text-slate-300">
              <div className="text-cyan-300">[AUTONOMOUS-BOT · cadence={botInterval} · provider=free-local ($0)]</div>
              <div>1. Triggering scheduled graph sweep on authorized target scope...</div>
              <div>2. SQLite baseline loaded → correlating delta findings across 121 engines...</div>
              <div>3. Recalculating Dijkstra paths + Prometheus /metrics counters...</div>
              <div className="text-emerald-300">4. WebSocket notification stream ready · 20 auto-fix patch candidates prepared.</div>
            </div>
          </div>
        )}

        {activeTab === "hunt" && (
          <div className="space-y-4">
            <h4 className="font-display text-lg font-bold text-white">
              Threat Hunting & Shadow-IT Query Engine
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  query: "FIND assets WHERE exposure = 'public' AND tls_grade IN ('C','F') OR hsts = false",
                  purpose: "Identifies shadow subdomains and misconfigured edge TLS endpoints.",
                },
                {
                  query: "TRACE path FROM internet TO crown_jewel WHERE hops <= 4 AND choke_point.betweenness > 0.7",
                  purpose: "Isolates shortest high-leverage lateral movement chains.",
                },
              ].map((item) => (
                <div key={item.query} className="rounded-xl border border-white/10 bg-black/50 p-4">
                  <div className="font-mono text-xs text-cyan-300">{item.query}</div>
                  <p className="mt-2 text-xs text-slate-400">{item.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "zerotrust" && (
          <div className="space-y-3">
            <h4 className="font-display text-lg font-bold text-white">
              Zero-Trust Policy Generator Output
            </h4>
            <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-cyan-200">
{`policy_version: "2.5-zero-trust"
default_ingress: DENY_ALL
microsegmentation:
  - service: "api-gateway"
    require_mtls: true
    enforce_rate_limit: "20r/s"
  - service: "crown-jewel-db"
    allowed_sources: ["verified-api-worker"]
    token_ttl_max_seconds: 900`}
            </pre>
          </div>
        )}

        {activeTab === "remediation" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-display text-lg font-bold text-white">
                Automated Remediation (20 Auto-Fix Engines)
              </h4>
              <div className="flex gap-2">
                {remedies.map((r, idx) => (
                  <button
                    key={r.title}
                    type="button"
                    onClick={() => setSelectedRemedy(idx)}
                    className={`rounded-lg border px-2.5 py-1 text-xs ${
                      selectedRemedy === idx
                        ? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
                        : "border-white/10 bg-white/5 text-slate-400"
                    }`}
                  >
                    Fix #{idx + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/60 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {remedies[selectedRemedy].title}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Target Edge: {remedies[selectedRemedy].target}
              </div>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-[#050608] p-3 font-mono text-xs text-emerald-200">
                {remedies[selectedRemedy].patch}
              </pre>
              <div className="mt-3 font-mono text-[11px] text-cyan-300">
                Verification: {remedies[selectedRemedy].verifyCurl}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
