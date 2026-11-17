import fs from "node:fs";
import path from "node:path";

export interface GitHubRepoSummary {
  name: string;
  description: string;
  language: string | null;
  htmlUrl: string;
  homepage: string | null;
  updatedAt: string;
  pushedAt: string;
  stargazersCount: number;
  topics: string[];
}

export interface GitHubActivityPayload {
  username: string;
  profileUrl: string;
  avatarUrl: string;
  name: string;
  bio: string;
  publicReposCount: number;
  followers: number;
  languageBreakdown: Array<{ language: string; count: number }>;
  repositories: GitHubRepoSummary[];
  fetchedAt: string;
  source: "live" | "cache" | "fallback";
}

const CACHE_TTL_MS = 15 * 60 * 1000;

function getCacheFilePath(): string {
  return path.resolve(process.cwd(), "storage", "db", "github-cache.json");
}

const VERIFIED_FALLBACK_REPOS: GitHubRepoSummary[] = [
  {
    name: "Intelligent-Graph-Based-Attack-Path-Discovery",
    description:
      "Intelligent Graph-Based Attack Path Discovery & Automated Lateral Movement Simulation Framework (v2.5)",
    language: "Python",
    htmlUrl:
      "https://github.com/Shourya-Sinha/Intelligent-Graph-Based-Attack-Path-Discovery",
    homepage: null,
    updatedAt: "2026-09-23T17:46:40Z",
    pushedAt: "2026-09-23T17:46:33Z",
    stargazersCount: 0,
    topics: [],
  },
  {
    name: "Telegram-Blockchain-Transactions",
    description:
      "Custodial Telegram Mini App wallet & red-envelope blockchain transaction system using TypeScript, PostgreSQL ledger, and TronWeb",
    language: "TypeScript",
    htmlUrl: "https://github.com/Shourya-Sinha/Telegram-Blockchain-Transactions",
    homepage: null,
    updatedAt: "2026-11-02T12:36:29Z",
    pushedAt: "2026-11-16T17:11:54Z",
    stargazersCount: 0,
    topics: [],
  },
  {
    name: "PortPilot",
    description:
      "Local-first deployment and HomeDeploy dashboard with GitHub build engine, app runtime supervisor, and custom hostname routing",
    language: "TypeScript",
    htmlUrl: "https://github.com/Shourya-Sinha/PortPilot",
    homepage: null,
    updatedAt: "2026-10-29T13:20:12Z",
    pushedAt: "2026-10-29T13:20:06Z",
    stargazersCount: 0,
    topics: [],
  },
  {
    name: "Ananta_Infratech_Solutions",
    description:
      "Construction workforce ERP management system and worker mobile application with real-time notifications and Docker support",
    language: "JavaScript",
    htmlUrl: "https://github.com/Shourya-Sinha/Ananta_Infratech_Solutions",
    homepage: null,
    updatedAt: "2026-10-29T03:30:28Z",
    pushedAt: "2026-10-29T03:30:23Z",
    stargazersCount: 0,
    topics: [],
  },
  {
    name: "fantasy-arena-full",
    description:
      "Skill-based fantasy gaming platform architecture with real-time WebSocket scoring, Redis caching, and admin console",
    language: "JavaScript",
    htmlUrl: "https://github.com/Shourya-Sinha/fantasy-arena-full",
    homepage: null,
    updatedAt: "2026-08-13T12:25:32Z",
    pushedAt: "2026-08-13T12:24:57Z",
    stargazersCount: 0,
    topics: [],
  },
  {
    name: "Python_Jarvis",
    description:
      "Desktop AI and system automation assistant with voice workflows and multi-app control in Python",
    language: "Python",
    htmlUrl: "https://github.com/Shourya-Sinha/Python_Jarvis",
    homepage: null,
    updatedAt: "2025-04-26T07:53:31Z",
    pushedAt: "2025-04-26T07:53:31Z",
    stargazersCount: 0,
    topics: [],
  },
];

export async function getGitHubActivity(
  username = "Shourya-Sinha",
  forceRefresh = false
): Promise<GitHubActivityPayload> {
  const cachePath = getCacheFilePath();
  if (!forceRefresh && fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, "utf8")) as GitHubActivityPayload;
      if (
        cached.username === username &&
        Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS
      ) {
        return { ...cached, source: "cache" };
      }
    } catch {
      // ignore corrupted cache
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "shourya-portfolio-platform",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers,
        signal: AbortSignal.timeout(5000),
      }),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=30&sort=updated`,
        {
          headers,
          signal: AbortSignal.timeout(5000),
        }
      ),
    ]);

    if (!profileRes.ok || !reposRes.ok) {
      throw new Error(`GitHub API returned ${profileRes.status}/${reposRes.status}`);
    }

    const profileJson = (await profileRes.json()) as {
      login: string;
      html_url: string;
      avatar_url: string;
      name: string | null;
      bio: string | null;
      public_repos: number;
      followers: number;
    };

    const reposJson = (await reposRes.json()) as Array<{
      name: string;
      description: string | null;
      language: string | null;
      html_url: string;
      homepage: string | null;
      updated_at: string;
      pushed_at: string;
      stargazers_count: number;
      topics?: string[];
      fork: boolean;
    }>;

    const nonForkRepos = reposJson.filter((r) => !r.fork);
    const langCounts = new Map<string, number>();
    for (const r of nonForkRepos) {
      if (r.language) {
        langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
      }
    }

    const payload: GitHubActivityPayload = {
      username: profileJson.login || username,
      profileUrl: profileJson.html_url || `https://github.com/${username}`,
      avatarUrl: profileJson.avatar_url || "",
      name: profileJson.name || "Shourya Sinha",
      bio: profileJson.bio || "Full Stack Developer | React Native | Python & Cybersecurity",
      publicReposCount: profileJson.public_repos ?? nonForkRepos.length,
      followers: profileJson.followers ?? 0,
      languageBreakdown: Array.from(langCounts.entries())
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count),
      repositories: nonForkRepos.slice(0, 12).map((r) => ({
        name: r.name,
        description: r.description || "Public repository on GitHub.",
        language: r.language,
        htmlUrl: r.html_url,
        homepage: r.homepage || null,
        updatedAt: r.updated_at,
        pushedAt: r.pushed_at,
        stargazersCount: r.stargazers_count ?? 0,
        topics: r.topics || [],
      })),
      fetchedAt: new Date().toISOString(),
      source: "live",
    };

    const dir = path.dirname(cachePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(payload, null, 2), "utf8");
    return payload;
  } catch {
    if (fs.existsSync(cachePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cachePath, "utf8")) as GitHubActivityPayload;
        return { ...cached, source: "cache" };
      } catch {
        // fallback below
      }
    }
    return {
      username,
      profileUrl: `https://github.com/${username}`,
      avatarUrl: "",
      name: "Shourya Sinha",
      bio: "Software Developer | Full Stack, React Native, Python & Cybersecurity",
      publicReposCount: 51,
      followers: 2,
      languageBreakdown: [
        { language: "JavaScript", count: 31 },
        { language: "TypeScript", count: 8 },
        { language: "Python", count: 4 },
        { language: "HTML", count: 3 },
      ],
      repositories: VERIFIED_FALLBACK_REPOS,
      fetchedAt: new Date().toISOString(),
      source: "fallback",
    };
  }
}
