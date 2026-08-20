import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { collectReport, renderMarkdown } from "./github-health-inventory.mjs";

const statePath = process.env.STATE_PATH || "/tmp/persistent-continuation-state.json";
const outputDir = process.env.OUTPUT_DIR || dirname(statePath);
const maxCycles = Math.max(1, Number(process.env.MAX_CYCLES || 2400));

async function readState() {
  try {
    return JSON.parse(await readFile(statePath, "utf8"));
  } catch {
    return { executionNumber: 0, history: [] };
  }
}

function summarize(report) {
  const repositories = report.repositories || [];
  return {
    repositories: repositories.length,
    successfulLatestRuns: repositories.filter(repo => (repo.latestRun || {}).conclusion === "success").length,
    failedLatestRuns: repositories.filter(repo => (repo.latestRun || {}).conclusion === "failure").length,
    repositoriesWithoutRuns: repositories.filter(repo => !repo.latestRun).length,
    repositoryErrors: repositories.filter(repo => repo.error).length,
  };
}

export async function runContinuation(env = process.env) {
  const previous = await readState();
  const previousExecution = Number(previous.executionNumber || 0);
  const now = new Date().toISOString();
  if (previousExecution >= maxCycles) {
    const halted = {
      version: 1,
      executionNumber: previousExecution,
      maxCycles,
      status: "complete",
      generatedAt: now,
      action: "Health verification paused after reaching the configured cycle limit.",
      remainingBlocker: null,
      summary: previous.summary || null,
      history: (previous.history || []).slice(-23),
    };
    await mkdir(dirname(statePath), { recursive: true });
    await writeFile(statePath, `${JSON.stringify(halted, null, 2)}\n`);
    return halted;
  }

  const report = await collectReport(env);
  const executionNumber = previousExecution + 1;
  const entry = {
    executionNumber,
    timestamp: now,
    workflow: "persistent-continuation",
    action: "Read-only repository and GitHub Actions health inventory",
    result: "completed",
    failureCategory: summarize(report).failedLatestRuns ? "historical-or-current-failure-evidence" : null,
    recoveryAttempt: "none; destructive repair is intentionally outside this read-only continuation",
    validationStatus: "collector-completed",
    remainingBlocker: env.REPO_AUDIT_TOKEN ? null : "REPO_AUDIT_TOKEN is not configured; the workflow uses current-repository GITHUB_TOKEN fallback",
    nextRecommendedAction: "Inspect the latest artifact and prioritize only reproducible actionable failures",
  };
  const state = {
    version: 1,
    executionNumber,
    maxCycles,
    status: executionNumber >= maxCycles ? "complete" : "active",
    generatedAt: now,
    summary: summarize(report),
    current: entry,
    history: [...(previous.history || []), entry].slice(-24),
  };
  await mkdir(dirname(statePath), { recursive: true });
  await mkdir(outputDir, { recursive: true });
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
  await writeFile(join(outputDir, "github-health.json"), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(join(outputDir, "github-health.md"), `${renderMarkdown(report)}\n`);
  return state;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runContinuation().then(state => {
    console.log(JSON.stringify({
      executionNumber: state.executionNumber,
      maxCycles: state.maxCycles,
      status: state.status,
      summary: state.summary,
      remainingBlocker: state.current?.remainingBlocker || state.remainingBlocker || null,
    }));
  }).catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
