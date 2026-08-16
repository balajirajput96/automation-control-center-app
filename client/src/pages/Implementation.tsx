import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { implementationDependencies } from "@shared/automationData";
import { ExternalLink, FolderOpen } from "lucide-react";

export default function Implementation() {
  const { data } = trpc.automation.overview.useQuery(undefined, { refetchInterval: 30_000 });
  return <div><PageHeader eyebrow="Source-aligned status" title="Implementation status" description="The completed-work table below mirrors the structure and content of docs/implementation-status.md. It is intentionally preserved as approved implementation evidence." />
    <StatusTable title="Completed work" columns={["Component", "Completion status", "Result"]} rows={data?.implementationRows ?? []} />
    <div className="mt-5"><StatusTable title="Remaining implementation dependencies" columns={["Dependency", "Required completion step", "Why it matters"]} rows={implementationDependencies} /></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-2"><Card><CardHeader><CardTitle className="text-sm">Google Workspace destination</CardTitle></CardHeader><CardContent className="flex items-start gap-3"><div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5"><FolderOpen className="h-5 w-5 text-primary" /></div><div><p className="text-sm font-semibold">Automation Control Center</p><p className="mt-1 break-all font-mono text-xs text-primary">1wwQXNYhxGkhaVrHJn6BHX8jOp41XZcqo</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Private Google Drive report destination verified through the connected Google Workspace integration.</p></div></CardContent></Card><Card><CardHeader><CardTitle className="text-sm">GitHub workflow scope</CardTitle></CardHeader><CardContent><p className="font-mono text-sm text-primary">automation-control-health</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Latest scoped validation: pass · run 31945761102.</p><a className="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:underline" href="https://github.com/balajirajput96/automation-control-center/actions/runs/31945761102" target="_blank" rel="noreferrer">Open validation evidence <ExternalLink className="ml-1.5 h-3.5 w-3.5" /></a></CardContent></Card></div>
  </div>;
}

function InlineEvidence({ value }: { value: string }) {
  return <>{value.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8em] text-primary">{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    return part;
  })}</>;
}

function StatusTable({ title, columns, rows }: { title: string; columns: string[]; rows: readonly (readonly string[])[] }) {
  return <Card className="overflow-hidden"><CardHeader className="border-b border-border/70"><CardTitle className="text-sm">{title}</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow>{columns.map(column => <TableHead className="min-w-48" key={column}>{column}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={index}>{row.map((cell, cellIndex) => <TableCell className={cellIndex === 0 ? "align-top font-semibold" : "align-top whitespace-pre-wrap text-sm leading-6 text-muted-foreground"} key={`${index}-${cellIndex}`}><InlineEvidence value={cell} /></TableCell>)}</TableRow>)}</TableBody></Table></div></CardContent></Card>;
}
