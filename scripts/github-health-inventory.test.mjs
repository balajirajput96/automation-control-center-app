import test from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown, summarizeRepository } from "./github-health-inventory.mjs";

test("summarizes a repository without exposing credentials", () => {
  const result = summarizeRepository(
    { full_name: "example/repo", visibility: "private", default_branch: "main", archived: false },
    { id: 42, name: "CI", status: "completed", conclusion: "success", html_url: "https://github.com/example/repo/actions/runs/42" },
    [],
  );
  assert.deepEqual(result, {
    name: "example/repo",
    visibility: "private",
    defaultBranch: "main",
    archived: false,
    latestRun: {
      id: 42,
      name: "CI",
      status: "completed",
      conclusion: "success",
      createdAt: null,
      updatedAt: null,
      url: "https://github.com/example/repo/actions/runs/42",
    },
    openPullRequests: 0,
    error: null,
  });
});

test("renders a read-only inventory with failure links", () => {
  const markdown = renderMarkdown({
    generatedAt: "2026-08-20T00:00:00.000Z",
    repositories: [
      summarizeRepository(
        { full_name: "example/repo", visibility: "public", default_branch: "master", archived: false },
        { id: 7, name: "Tests", status: "completed", conclusion: "failure", html_url: "https://github.com/example/repo/actions/runs/7" },
        [{ number: 1 }],
      ),
    ],
  });
  assert.match(markdown, /1 repositories/);
  assert.match(markdown, /1 failed/);
  assert.match(markdown, /https:\/\/github\.com\/example\/repo\/actions\/runs\/7/);
  assert.match(markdown, /never commits, pushes, rebases, merges/);
});
