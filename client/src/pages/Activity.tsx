import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CheckCircle2, Github, GitPullRequest, ScanSearch } from "lucide-react";

const commits = [
  ["2dd8793", "Add Manus AI automation command center"],
  ["7dbdeb1", "Validate n8n workflow execution"],
  ["8c0afc5", "Record successful Gemini automation repair"],
];

export default function Activity() {
  const { data } = trpc.automation.overview.useQuery(undefined, { refetchInterval: 30_000 });

  return (
    <div>
      <PageHeader
        eyebrow="Evidence and remediation"
        title="Antigravity activity log"
        description="Repository audit findings, the approved low-risk improvement, and traceable validation evidence from the private automation project."
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader><CardTitle className="text-sm">Latest activity</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {data?.activity.map((item, index) => (
              <div className="relative flex gap-4 pb-7 last:pb-0" key={item.id}>
                {index < data.activity.length - 1 && <div className="absolute left-[5px] top-4 h-[calc(100%-5px)] w-px bg-border" />}
                <div className="relative mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-card bg-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2"><p className="text-sm font-semibold">{item.title}</p><StatusBadge status={item.status} /></div>
                    <span className="font-mono text-[10px] text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-primary">{item.service}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ScanSearch className="h-4 w-4 text-primary" />Repository audit finding</CardTitle></CardHeader><CardContent><p className="text-sm font-semibold">Deprecated Gemini health-check endpoint</p><p className="mt-2 text-sm leading-6 text-muted-foreground">The daily review identified a deprecated model endpoint and limited the change to the health-check script and its static validation contract.</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><GitPullRequest className="h-4 w-4 text-primary" />Applied improvement</CardTitle></CardHeader><CardContent><p className="text-sm font-semibold">Migrated to the Interactions API</p><p className="mt-2 text-sm leading-6 text-muted-foreground">The health check now uses the stateless Interactions API path and verified model output parsing.</p></CardContent></Card>
          <Card className="border-amber-400/20 bg-amber-400/5"><CardContent className="p-5"><AlertTriangle className="h-5 w-5 text-amber-200" /><p className="mt-3 text-sm font-semibold text-amber-100">Open risk flag</p><p className="mt-1 text-sm leading-6 text-amber-50/80">Persistent local execution remains dependent on a connected Docker host. The review does not expose services or modify credentials.</p></CardContent></Card>
          <Card className="border-cyan-400/20 bg-cyan-400/5"><CardContent className="p-5"><CheckCircle2 className="h-5 w-5 text-cyan-200" /><p className="mt-3 text-sm font-semibold text-cyan-100">Validation evidence</p><p className="mt-1 font-mono text-xs text-cyan-50/80">GitHub Actions run 31945761102 · success</p></CardContent></Card>
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Github className="h-4 w-4 text-primary" />GitHub Actions · automation-control-health</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3">
            <div><p className="text-sm font-semibold">Latest result · pass</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">Run 31945761102 · private main branch</p></div>
            <CheckCircle2 className="h-5 w-5 text-cyan-200" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left">
              <thead className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="pb-2 font-medium">Commit</th><th className="pb-2 font-medium">Change</th><th className="pb-2 font-medium">Result</th></tr></thead>
              <tbody className="text-sm">{commits.map(([commit, message]) => <tr className="border-t border-border/70" key={commit}><td className="py-3 font-mono text-primary">{commit}</td><td className="py-3">{message}</td><td className="py-3 font-semibold text-cyan-200">pass</td></tr>)}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
