import { Badge } from "@/components/ui/badge";
import type { BadgeStatus } from "@shared/automationData";

const styles: Record<BadgeStatus, string> = {
  active: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
  prepared: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  blocked: "border-rose-400/25 bg-rose-400/10 text-rose-200",
};

export default function StatusBadge({ status }: { status: BadgeStatus }) {
  return <Badge className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${styles[status]}`}>{status}</Badge>;
}
