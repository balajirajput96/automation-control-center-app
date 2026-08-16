export const allowedBadgeStatuses = ["active", "prepared", "blocked"] as const;
export type BadgeStatus = (typeof allowedBadgeStatuses)[number];

export type ServiceStatus = {
  id: string;
  name: string;
  status: BadgeStatus;
  summary: string;
  detail: string;
  verifiedAt: string;
  metric: string;
};

export const serviceStatuses: ServiceStatus[] = [
  { id: "n8n", name: "n8n", status: "prepared", summary: "Workflow execution validated", detail: "Temporary Community Edition 2.34.6 instance imported and executed the control-report workflow. Persistent Docker host remains required.", verifiedAt: "2026-08-16 11:56 UTC", metric: "1 validated workflow" },
  { id: "antigravity", name: "Antigravity CLI", status: "active", summary: "Authenticated repository review", detail: "A read-only audit identified the deprecated Gemini health-check path and reviewed the published automation project.", verifiedAt: "2026-08-16 11:38 UTC", metric: "1 applied improvement" },
  { id: "gemini", name: "Gemini API", status: "active", summary: "Interactions API healthy", detail: "Stateless Interactions API health check returned automation-connector-ok using gemini-3.6-flash.", verifiedAt: "2026-08-16 11:40 UTC", metric: "gemini-3.6-flash" },
  { id: "drive", name: "Google Drive", status: "active", summary: "Report folder available", detail: "Automation Control Center folder is available and remains private.", verifiedAt: "2026-08-16 11:56 UTC", metric: "Folder verified" },
  { id: "julius", name: "Julius", status: "blocked", summary: "Native session required", detail: "The browser OAuth flow returned a blank page before a session and source dataset could be verified.", verifiedAt: "Not verified", metric: "Awaiting dataset" },
  { id: "github", name: "GitHub Actions", status: "active", summary: "Health workflow passed", detail: "automation-control-health validated the private repository, JSON template, and secret-exclusion rules.", verifiedAt: "2026-08-16 12:00 UTC", metric: "Run 31945761102" },
];

export const automationActivity = [
  { id: "a1", service: "Antigravity CLI", status: "active" as BadgeStatus, time: "11:38 UTC", title: "Repository review completed", detail: "Flagged the deprecated Gemini health-check endpoint and confirmed a low-risk migration path." },
  { id: "a2", service: "Gemini API", status: "active" as BadgeStatus, time: "11:40 UTC", title: "Interactions API verified", detail: "The stateless health check returned automation-connector-ok with gemini-3.6-flash." },
  { id: "a3", service: "n8n", status: "prepared" as BadgeStatus, time: "11:56 UTC", title: "Workflow imported and executed", detail: "The Daily Automation Control Report template produced a successful timestamped control-report item." },
  { id: "a4", service: "GitHub Actions", status: "active" as BadgeStatus, time: "12:00 UTC", title: "automation-control-health passed", detail: "Run 31945761102 passed repository, JSON, Python syntax, and secret tracking checks." },
];

export const implementationRows = [
  ["Private GitHub control center", "Complete", "Repository: `https://github.com/balajirajput96/automation-control-center` with a clean `main` branch"],
  ["n8n local deployment package", "Prepared", "Docker Compose configuration with persistent n8n storage, local-only binding, deployment instructions, workflow template, and credential safety guidance"],
  ["n8n temporary execution", "Validated", "The template was imported into isolated n8n Community Edition 2.34.6 data and executed successfully through the CLI"],
  ["Gemini Spark automation", "Active", "`Generate daily morning briefing` runs daily at approximately 08:00 local time and is restricted to a private, read-only briefing"],
  ["Daily control review", "Active", "Runs daily at 09:15 Asia/Kolkata using GitHub and Google Workspace connectors; it assesses readiness and can update only validated documentation in the private repository"],
  ["Google Drive report destination", "Complete", "Private folder created: **Automation Control Center**"],
  ["Google Drive verification", "Complete", "A read-only Drive request succeeded through the connected Google Workspace integration"],
  ["Antigravity CLI", "Complete in the current workspace", "Installed, authenticated as `sellbuildingbazar.in@gmail.com` with Google AI Pro, and used to audit and harden the repository"],
  ["Antigravity daily-review design", "Scheduled", "Read-only headless runner, schema-controlled prompt, and daily maintenance policy are committed to GitHub and included in the 09:15 review"],
  ["Gemini CLI", "Complete in the current workspace", "Installed and verified in the configured Gemini API-key mode with a successful headless health check"],
  ["Julius scheduled analysis design", "Prepared", "Template prompt and setup requirements are stored in the private repository; the Julius session remains unverified"],
  ["GitHub Actions validation", "Active and validated", "The read-only `Automation Control Health` workflow is scheduled daily and its first manual run completed successfully"],
] as const;

export const implementationDependencies = [
  ["Windows computer connection", "Attach the computer to this task and bind an empty folder, such as `C:\\n8n`", "Enables the free, persistent local n8n and Antigravity installations"],
  ["Docker Desktop", "Install and start Docker Desktop on the connected Windows computer", "Required to start local n8n with durable workflow and credential storage"],
  ["Persistent Antigravity host", "Run the authenticated CLI from a connected Windows computer or another persistent host", "The current sandbox is not a guaranteed persistent execution environment for a local daily CLI process"],
  ["Julius account", "Complete a successful Julius sign-in and choose its source dataset and report destination", "Julius schedules are created in its own interface, and Julius cannot itself be invoked through a public API [4]"],
  ["n8n legacy workflows", "Restore the correct old instance URL or export workflow JSON files", "The previous configured endpoint reports no active workspace, preventing direct inspection or repair"],
] as const;
