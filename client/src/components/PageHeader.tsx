import { Activity, Radio } from "lucide-react";

export default function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-border/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary"><Activity className="h-3.5 w-3.5" /> {eyebrow}</p>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-foreground md:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2 self-start rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-200 lg:self-auto"><Radio className="h-3.5 w-3.5 animate-pulse" /> Last signal: live snapshot</div>
    </header>
  );
}
