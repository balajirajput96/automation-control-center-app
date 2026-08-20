import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { collectReport, renderMarkdown } from "./github-health-inventory.mjs";

const MAX_EXECUTIONS = 2400;
const stateFile = process.env.STATE_FILE || "state/continuation-state.json";
const outputDir = process.env.OUTPUT_DIR || "artifacts/hourly-continuation";
const recordFile = process.env.RECORD_FILE || join(outputDir, "execution-record.jsonl");

async function readState() {
  try {
    const parsed = JSON.parse(await readFile(stateFile, "utf8"));
    if (!parsed || typeof parsed !== "object") throw new Error("state is not an object");
    return parsed;
  } catch {
    return {
      executionNumber: 0,
      maxExecutions: MAX_EXECUTIONS,
      status: "new",
      lastRunAt: null,
      nextRecommendedAction: "Run the first read-only health inventory.",
      remainingBlockers: [],
    };
  }
}

function safeSummary(report) {
  const repositories = Array.isArray(report.repositories) ? report.repositories : [];
  const failed = repositories.filter((repo) => repo.latestRun?.conclusion === "failure").length;
  const errors = repositories.filter((repo) => repo.error).length;
  const openPullRequests = repositories.reduce((total, repo) => total + (repo.openPullRequests || 0), 0);
  return {
    repositories: repositories.length,
    latestDefaultBranchFailures: failed,
    repositoryInspectionErrors: errors,
    openPullRequests,
  };
}

async function main() {
  const state = await readState();
  const previousNumber = Number.isInteger(state.executionNumber) ? state.executionNumber : 0;
  const executionNumber = Math.min(previousNumber + 1, MAX_EXECUTIONS);
  const generatedAt = new Date().toISOString();
  await mkdir(dirname(stateFile), { recursive: true });
  await mkdir(outputDir, { recursive: true });

  if (previousNumber >= MAX_EXECUTIONS || state.status === "complete") {
    const completedState = {
      ...state,
      executionNumber: MAX_EXECUTIONS,
      maxExecutions: MAX_EXECUTIONS,
      status: "complete",
      lastRunAt: generatedAt,
      nextRecommendedAction: "No further hourly repair cycle is required; perform health checks only if this workflow is intentionally re-enabled.",
    };
    await writeFile(stateFile, `${JSON.stringify(completedState, null, 2)}\n`);
    await appendFile(recordFile, `${JSON.stringify({
      executionNumber: MAX_EXECUTIONS,
      timestamp: generatedAt,
      repository: "account-wide",
      task: "hourly engineering continuation",
      cliConnectorApi: "GitHub Actions + GitHub REST",
      action: "cycle limit reached; no-op safe stop",
      result: "complete",
      failureCategory: "none",
      recoveryAttempt: false,
      validationStatus: "passed",
      remainingBlocker: "none",
      nextRecommendedAction: "Health verification only",
    })}\n`);
    return;
  }

  const report = await collectReport({
    ...process.env,
    MAX_REPOSITORIES: process.env.MAX_REPOSITORIES || "250",
  });
  const summary = safeSummary(report);
  const healthy = summary.latestDefaultBranchFailures === 0 && summary.repositoryInspectionErrors === 0;
  const result = healthy ? "healthy_read_only_inventory" : "needs_review";
  const nextRecommendedAction = healthy
    ? "Continue the next hourly health inventory; do not invent changes when no reproducible failure exists."
    : "Inspect the generated inventory artifact, reproduce actionable failures, and repair only in recoverable branches.";
  const nextState = {
    executionNumber,
    maxExecutions: MAX_EXECUTIONS,
    status: "active",
    lastRunAt: generatedAt,
    result,
    healthSummary: summary,
    remainingBlockers: summary.repositoryInspectionErrors > 0 ? ["One or more repositories could not be inspected with the available read-only authorization."] : [],
    nextRecommendedAction,
  };
  const record = {
    executionNumber,
    timestamp: generatedAt,
    repository: "account-wide",
    task: "hourly engineering continuation",
    cliConnectorApi: "GitHub Actions + GitHub REST",
    action: "read-only repository health inventory and persistent state update",
    result,
    failureCategory: healthy ? "none" : "repository_health_review",
    recoveryAttempt: false,
    validationStatus: "passed",
    remainingBlocker: nextState.remainingBlockers.join(" ") || "none",
    nextRecommendedAction,
  };
  await writeFile(stateFile, `${JSON.stringify(nextState, null, 2)}\n`);
  await writeFile(join(outputDir, "github-health.json"), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(join(outputDir, "github-health.md"), `${renderMarkdown(report)}\n`);
  await writeFile(join(outputDir, "continuation-state.json"), `${JSON.stringify(nextState, null, 2)}\n`);
  await appendFile(recordFile, `${JSON.stringify(record)}\n`);
  console.log(JSON.stringify({ executionNumber, maxExecutions: MAX_EXECUTIONS, result, summary }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
