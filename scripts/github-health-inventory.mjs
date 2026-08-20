import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const API = "https://api.github.com";
const API_VERSION = "2022-11-28";

function accountTokenFromEnv(env = process.env) {
  return env.REPO_AUDIT_TOKEN || env.GH_TOKEN || "";
}

function tokenFromEnv(env = process.env) {
  return accountTokenFromEnv(env) || env.GITHUB_TOKEN || "";
}

function headers(token) {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function filterActiveOwnedRepositories(
  repositories,
  owner = "balajirajput96"
) {
  return repositories.filter(
    repo =>
      repo?.owner?.login === owner &&
      repo.fork === false &&
      repo.archived === false
  );
}

export function summarizeRepository(repo, latestRun, openPulls, error = null) {
  return {
    name: repo.full_name,
    visibility: repo.visibility || (repo.private ? "private" : "public"),
    defaultBranch: repo.default_branch || "main",
    archived: Boolean(repo.archived),
    latestRun: latestRun
      ? {
          id: latestRun.id,
          name: latestRun.name || latestRun.workflow_name || "unknown",
          status: latestRun.status || "unknown",
          conclusion: latestRun.conclusion || null,
          createdAt: latestRun.created_at || null,
          updatedAt: latestRun.updated_at || null,
          url: latestRun.html_url || null,
        }
      : null,
    openPullRequests: Array.isArray(openPulls) ? openPulls.length : 0,
    error,
  };
}

export function renderMarkdown(report) {
  const rows = report.repositories.map(repo => {
    const run = repo.latestRun;
    const conclusion = run?.conclusion || run?.status || "none";
    const link = run?.url ? `[${conclusion}](${run.url})` : conclusion;
    return `| ${repo.name} | ${repo.defaultBranch} | ${repo.visibility} | ${link} | ${repo.openPullRequests} | ${repo.error || ""} |`;
  });
  const failed = report.repositories.filter(
    repo => repo.latestRun?.conclusion === "failure"
  ).length;
  const successful = report.repositories.filter(
    repo => repo.latestRun?.conclusion === "success"
  ).length;
  return [
    "# GitHub Health Inventory",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Coverage: **${report.repositories.length} repositories**; latest default-branch Actions results: **${successful} successful**, **${failed} failed**. This inventory is read-only and never commits, pushes, rebases, merges, or changes repository settings.`,
    report.scope?.warning ? `Scope warning: **${report.scope.warning}**` : "",
    "",
    "| Repository | Default branch | Visibility | Latest Actions result | Open PRs | Error |",
    "|---|---|---|---|---:|---|",
    ...rows,
    "",
    "## Authentication note",
    "",
    "The workflow should receive a least-privilege read-only token through `REPO_AUDIT_TOKEN`. If that secret is absent, GitHub Actions falls back to its repository-scoped token and coverage may be limited to the control-center repository.",
    "",
  ].join("\n");
}

async function githubJson(path, token, params = {}) {
  const url = new URL(`${API}${path}`);
  for (const [key, value] of Object.entries(params))
    url.searchParams.set(key, String(value));
  const response = await fetch(url, { headers: headers(token) });
  const body = await response.text();
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    payload = { message: body.slice(0, 300) };
  }
  if (!response.ok)
    throw new Error(
      `${response.status}: ${payload.message || "GitHub API request failed"}`
    );
  return payload;
}

async function listRepositories(token, maxRepositories, env = process.env) {
  const owner =
    env.AUDIT_OWNER || env.GITHUB_REPOSITORY_OWNER || "balajirajput96";
  const explicit = (env.WATCHLIST_REPOS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);
  if (explicit.length) {
    const requested = await Promise.all(
      explicit.map(name => githubJson(`/repos/${name}`, token))
    );
    return filterActiveOwnedRepositories(requested, owner).slice(
      0,
      maxRepositories
    );
  }
  if (!accountTokenFromEnv(env) && env.GITHUB_REPOSITORY) {
    const current = await githubJson(`/repos/${env.GITHUB_REPOSITORY}`, token);
    return filterActiveOwnedRepositories([current], owner);
  }
  const repositories = [];
  for (let page = 1; repositories.length < maxRepositories; page += 1) {
    const batch = await githubJson("/user/repos", token, {
      affiliation: "owner,collaborator,organization_member",
      per_page: 100,
      page,
      sort: "updated",
      direction: "desc",
    });
    if (!batch.length) break;
    repositories.push(...filterActiveOwnedRepositories(batch, owner));
    if (batch.length < 100) break;
  }
  return repositories.slice(0, maxRepositories);
}

async function inspectRepository(repo, token) {
  try {
    const [runs, pulls] = await Promise.all([
      githubJson(`/repos/${repo.full_name}/actions/runs`, token, {
        branch: repo.default_branch,
        per_page: 1,
      }),
      githubJson(`/repos/${repo.full_name}/pulls`, token, {
        state: "open",
        per_page: 100,
      }),
    ]);
    return summarizeRepository(
      repo,
      runs.workflow_runs?.[0] || null,
      pulls,
      null
    );
  } catch (error) {
    return summarizeRepository(
      repo,
      null,
      [],
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function collectReport(env = process.env) {
  const token = tokenFromEnv(env);
  if (!token)
    throw new Error(
      "Missing GH_TOKEN or GITHUB_TOKEN; refusing to make unauthenticated account-wide requests."
    );
  const owner =
    env.AUDIT_OWNER || env.GITHUB_REPOSITORY_OWNER || "balajirajput96";
  const accountWideToken = Boolean(env.REPO_AUDIT_TOKEN || env.GH_TOKEN);
  const maxRepositories = Math.max(
    1,
    Math.min(Number(env.MAX_REPOSITORIES || 250), 500)
  );
  const repositories = await listRepositories(token, maxRepositories, env);
  const results = [];
  for (let index = 0; index < repositories.length; index += 8) {
    const batch = repositories.slice(index, index + 8);
    results.push(
      ...(await Promise.all(batch.map(repo => inspectRepository(repo, token))))
    );
  }
  results.sort((a, b) => a.name.localeCompare(b.name));
  return {
    generatedAt: new Date().toISOString(),
    scope: {
      owner,
      activeNonForkOnly: true,
      accountWide: accountWideToken,
      warning: accountWideToken
        ? null
        : "REPO_AUDIT_TOKEN is not configured; only the current control-center repository can be inspected with GITHUB_TOKEN.",
    },
    repositories: results,
  };
}

async function main() {
  const report = await collectReport();
  const outputDir = process.env.OUTPUT_DIR || "artifacts/github-health";
  await mkdir(outputDir, { recursive: true });
  await writeFile(
    join(outputDir, "github-health.json"),
    `${JSON.stringify(report, null, 2)}\n`
  );
  await writeFile(
    join(outputDir, "github-health.md"),
    `${renderMarkdown(report)}\n`
  );
  console.log(
    `Inventoried ${report.repositories.length} repositories; reports written to ${outputDir}`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
