import test from "node:test";
import assert from "node:assert/strict";
import { safeSummary } from "./hourly-continuation.mjs";

test("marks an inventory with limited scope as needing review", () => {
  const summary = safeSummary({
    scope: {
      warning:
        "REPO_AUDIT_TOKEN is not configured; only the current control-center repository can be inspected with GITHUB_TOKEN.",
    },
    repositories: [
      {
        latestRun: { conclusion: "success" },
        openPullRequests: 0,
        error: null,
      },
    ],
  });

  assert.equal(summary.scopeLimited, true);
  assert.match(summary.scopeWarning, /REPO_AUDIT_TOKEN/);
});

test("keeps a complete inventory eligible for healthy status", () => {
  const summary = safeSummary({
    scope: { warning: null },
    repositories: [
      {
        latestRun: { conclusion: "success" },
        openPullRequests: 0,
        error: null,
      },
    ],
  });

  assert.equal(summary.scopeLimited, false);
  assert.equal(summary.scopeWarning, null);
});
