# Automation Continuity Manifest

This manifest preserves the scope of the work completed in the current project without copying sensitive terminal output, browser cookies, OAuth codes, or API keys into the repository.

## Preserved work categories

| Category | Preserved location or source | Daily automation treatment |
|---|---|---|
| GitHub repository and workflow inventory | Historical audit outputs under the sandbox project workspace and the sanitized remediation reports | Repeated read-only health inventory through `github-health-inventory.yml` |
| Repository repair and rebase history | `unresolved_fix_rebase_report.md`, `github_centered_automation_report.md`, and repository Git history | Used as evidence and regression context; no blind history rewriting |
| CLI/account status | `google_cli_login_status_report.md` and the protected official CLI credential stores | Status is documented; credential values are never copied |
| Connector and API map | `docs/connector-secret-map.md` | Only explicitly named, least-privilege references may be added later |
| GitHub Actions evidence | `artifacts/github-health/` from each inventory run | Uploaded as JSON and Markdown artifacts with 30-day retention |
| Local terminal and browser history | Retained in the sandbox only where the platform makes it available | Never uploaded wholesale; secrets and personal browser data are excluded |

## Daily control loop

1. GitHub Actions checks the control-center workflow from the default branch on its UTC schedule.
2. The inventory reads repository metadata, latest default-branch Actions status, and open pull-request counts.
3. The inventory emits JSON and Markdown artifacts.
4. A future summarization step may read only those artifacts and use a separately provisioned model key; it must not read shell history or connector credential stores.
5. Failures are reported as evidence. No daily job automatically commits, pushes, rebases, merges, changes permissions, or bypasses provider controls.

## Recovery and retention

The feature branch and pull request are the review boundary for the current inventory integration. Existing repository branches, reports, and worktrees are not deleted by this system. Disposable package caches may be cleaned to recover inode space; repository files, browser profiles, and credential stores are not disposable caches.

## Re-enabling account-wide coverage

Create a GitHub Actions secret named `REPO_AUDIT_TOKEN` with read-only access to the intended repositories, Actions runs, and pull requests. The workflow automatically uses it for account-wide coverage. If it is absent, the pull-request fallback intentionally scans only the current repository with `GITHUB_TOKEN`.
