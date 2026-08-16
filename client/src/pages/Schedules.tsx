import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { CalendarClock, Clock3, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

function nextRun(displayTime: string, timezone: string, enabled: boolean) {
  if (!enabled) return "Paused · configuration retained";
  return `${displayTime.startsWith("08:00") ? "Next 08:00 local" : "Next 09:15 IST"} · ${timezone}`;
}

export default function Schedules() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.automation.overview.useQuery(undefined, { refetchInterval: 30_000 });
  const update = trpc.automation.setScheduleEnabled.useMutation({
    onSuccess: () => {
      utils.automation.overview.invalidate();
      toast.success("Schedule state updated");
    },
    onError: () => toast.error("Schedule state could not be updated. Please retry."),
  });
  return <div><PageHeader eyebrow="Recurring controls" title="Daily schedules" description="Inspect the two configured daily controls. Switches update the private dashboard schedule state; the display preserves the exact configured time labels." />
    <div className="grid gap-4 xl:grid-cols-2">{data?.schedules.map(schedule => <Card key={schedule.id} className="overflow-hidden border-border/80"><CardHeader className="border-b border-border/70 bg-muted/20"><div className="flex items-start justify-between gap-4"><div className="flex gap-3"><div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5"><CalendarClock className="h-5 w-5 text-primary" /></div><div><CardTitle className="text-base">{schedule.name}</CardTitle><p className="mt-1 font-mono text-xs text-primary">{schedule.displayTime}</p></div></div><StatusBadge status={schedule.status} /></div></CardHeader><CardContent className="p-5"><p className="text-sm leading-6 text-muted-foreground">{schedule.detail}</p><div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="rounded-xl border border-border/80 bg-background/40 p-3"><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Next run</p><p className="mt-2 text-sm font-semibold">{nextRun(schedule.displayTime, schedule.timezone, schedule.enabled)}</p></div><div className="rounded-xl border border-border/80 bg-background/40 p-3"><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Last changed</p><p className="mt-2 text-sm font-semibold">{new Date(schedule.updatedAt).toLocaleString()}</p></div></div><div className="mt-5 flex items-center justify-between rounded-xl border border-border/80 p-3"><div><p className="text-sm font-semibold">Schedule enabled</p><p className="mt-1 text-xs text-muted-foreground">Disable to retain configuration without allowing the routine to run.</p></div><Switch checked={schedule.enabled} disabled={update.isPending || isLoading} onCheckedChange={enabled => update.mutate({ id: schedule.id, enabled })} aria-label={`Toggle ${schedule.name}`} /></div></CardContent></Card>)}</div>
    <Card className="mt-5 border-dashed border-border/90"><CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div className="flex gap-3"><Clock3 className="mt-0.5 h-5 w-5 text-primary" /><div><p className="font-semibold">Schedule operating boundary</p><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">This app manages the dashboard’s persistent schedule state. The existing Gemini Spark and daily review automations remain constrained to their approved read-only scopes.</p></div></div><Button variant="outline" className="border-border bg-transparent" onClick={() => { utils.automation.overview.invalidate(); toast.success("Automation snapshot refreshed"); }}><RefreshCcw className="mr-2 h-4 w-4" />Refresh snapshot</Button></CardContent></Card>
  </div>;
}
