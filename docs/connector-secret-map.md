# Connector and Secret Reference Map

This document records which enabled integrations may participate in the GitHub-centered maintenance system. It intentionally stores **references and scopes only**. It never stores OAuth tokens, API keys, refresh tokens, cookies, or private-key material.

## Operating rule

> Credentials remain in their official protected stores or GitHub Actions Secrets. Automation receives only the minimum secret reference required for a specific read-only operation.

| Enabled integration | Safe automation role | GitHub Actions reference | Default scope | Key material in repository |
|---|---|---|---|---|
| GitHub | Repository, pull-request, and Actions health inventory | `${{ github.token }}` for the current repository; `REPO_AUDIT_TOKEN` for account-wide read-only coverage | Contents/actions/pull requests read | No |
| Google Gemini | Optional daily summarization or classification of health artifacts | `GEMINI_API_KEY` only if separately provisioned by the user | Model API access limited to the named workflow | No |
| Google Workspace | Optional Drive/Docs report destination | Use a dedicated service account or official OAuth integration; do not export the connected account token | Report write access only to a designated private folder | No |
| n8n | Optional workflow orchestration | `N8N_INSTANCE_URL` and a separately provisioned `N8N_API_KEY`; prefer the existing protected connector | Workflow execution only for named maintenance workflow | No |
| n8n API | Optional workflow status verification | Protected `N8N_API_KEY` reference only | Read or execute named workflow | No |
| OpenAI | Optional artifact summarization | `OPENAI_API_KEY` if separately provisioned | Named model/API operation only | No |
| Anthropic | Optional artifact analysis | `ANTHROPIC_API_KEY` if separately provisioned | Named model/API operation only | No |
| OpenRouter API | Optional model fallback | `OPENROUTER_API_KEY` if separately provisioned | Named model/API operation only | No |
| Sentry | Optional error evidence | Use a dedicated read-only Sentry token provisioned by the user | Read issues/events only | No |
| Vercel | Optional deployment health evidence | Use a project-scoped read-only token provisioned by the user | Read deployment state only | No |
| Supabase | Optional database health evidence | Use a project-scoped read-only key provisioned by the user | Read-only tables/metadata only | No |
| Cloudflare / Worker Bindings | Optional infrastructure health evidence | Use a scoped API token provisioned by the user | Read-only account/project evidence only | No |
| Airtable | Optional control-data source | Use a read-only personal access token provisioned by the user | Read-only base/table access | No |
| Box / Notion | Optional report archival | Use the existing protected connector or a dedicated read-only integration | Designated folder/page only | No |
| Playwright / My Browser | Interactive browser verification only | Browser session remains in the browser connector | User-approved page operations | No |
| All other enabled connectors | Not wired by default | None | No access until a concrete workflow needs the integration | No |

## Required GitHub repository configuration

The read-only health workflow already uses the following environment contract:

| Secret or variable | Required | Purpose |
|---|---:|---|
| `REPO_AUDIT_TOKEN` | Recommended | Account-wide read-only repository, Actions, and pull-request inventory |
| `GITHUB_TOKEN` | Automatic | Safe current-repository fallback for pull-request verification |
| `GEMINI_API_KEY` | Optional | Gemini-based report summarization, if explicitly enabled later |
| `N8N_INSTANCE_URL` / `N8N_API_KEY` | Optional | n8n status or execution integration, if explicitly enabled later |

The current workflow does not call Gemini, n8n, Google Workspace, or any other external connector. This is intentional: adding a credential reference without a concrete, least-privilege use would widen the attack surface without improving repository health verification.

## Prohibited handling

Never copy values from connector configuration, browser storage, CLI token caches, shell history, or environment variables into source files, commit messages, artifacts, or logs. Never bypass OAuth, MFA, repository protection, or provider policy. A missing credential must produce a clear blocked status and a setup instruction, not a guessed token or a bypass.
