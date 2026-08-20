# Hourly Engineering Continuation Policy

## Purpose

This repository provides a bounded, read-only hourly continuation layer for the account-wide GitHub maintenance mission. The workflow runs once per hour for at most **2,400 cycles** (approximately 100 days), resumes from the latest successful state artifact, and records a redacted machine-readable execution record.

## Execution model

Each cycle restores the previous successful `hourly-continuation-state` artifact, runs the existing read-only GitHub health inventory, writes the next continuation state, and uploads the state and health report as artifacts. The state contains only cycle metadata, aggregate health counts, blockers, and the next recommended action. It never contains credentials, tokens, cookies, passwords, or private API values.

When no reproducible failure exists, the cycle records a healthy inventory and does not invent code changes. When a health problem is detected, the artifact records that the result needs review. Code changes, rebases, pull requests, and merges remain separate reviewable engineering actions; the hourly inventory does not mutate repositories or bypass branch protection.

## Authentication and permissions

The workflow uses the repository-scoped `GITHUB_TOKEN` for its own Actions and pull-request visibility. If account-wide read-only coverage is authorized, `REPO_AUDIT_TOKEN` may be configured as a GitHub Actions secret. The token is passed only through the runner environment and is never printed or persisted. The workflow requests `contents: read`, `actions: read`, and `pull-requests: read`; it does not request write permissions.

## Recovery and interruption

If a run is interrupted, the next successful run resumes from the most recent successful state artifact. A manual `reset_state` dispatch input is available for an intentional restart from cycle zero. At cycle 2,400 the workflow records a safe completion state and performs no further engineering mutation. Artifact retention is finite; long-term audit copies should be exported through an approved repository or storage process without adding secrets.

## Separation of responsibilities

GitHub Actions performs deterministic hourly inventory and state persistence. The existing daily AI-assisted maintenance schedule performs bounded diagnosis and review when judgment is useful. Both layers preserve uncommitted work, use recoverable branches, avoid blind merges and external publishing, classify missing-secret and hosted-runner blockers, and stop safely at authentication or authorization boundaries.
