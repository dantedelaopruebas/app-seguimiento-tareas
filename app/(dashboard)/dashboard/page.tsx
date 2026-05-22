import { Topbar } from "@/components/topbar";
import { CompletionChart } from "@/components/dashboard/charts";
import { ExportButton } from "@/components/dashboard/export-button";
import { getDashboardStats } from "@/lib/actions/stats";
import { Flame, CheckCircle2, AlertCircle, CalendarClock, ListTodo } from "lucide-react";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return (
    <>
      <Topbar title="Dashboard" subtitle="Vista general" />
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

          <div className="grid grid-cols-4 gap-3">
            <Stat icon={ListTodo} label="Total" value={stats.totals.total} />
            <Stat icon={CheckCircle2} label="Completadas" value={stats.totals.done} tint="text-accent" />
            <Stat icon={CalendarClock} label="Para hoy" value={stats.totals.todayDue} tint="text-priority-high" />
            <Stat icon={AlertCircle} label="Vencidas" value={stats.totals.overdue} tint="text-priority-urgent" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-bg-subtle border border-border-subtle rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-medium">Completadas · últimos 14 días</h3>
              </div>
              <CompletionChart data={stats.series} />
            </div>
            <div className="bg-bg-subtle border border-border-subtle rounded-lg p-4 flex flex-col items-center justify-center">
              <Flame className="w-7 h-7 text-priority-high mb-2" />
              <div className="text-4xl font-semibold tabular-nums">{stats.streak}</div>
              <div className="text-[12px] text-fg-muted mt-1">
                {stats.streak === 1 ? "día de racha" : "días de racha"}
              </div>
            </div>
          </div>

          <div className="bg-bg-subtle border border-border-subtle rounded-lg p-4">
            <h3 className="text-[13px] font-medium mb-3">Por proyecto</h3>
            <div className="space-y-2">
              {stats.byProject.length === 0 && (
                <p className="text-[12px] text-fg-subtle">Aún sin proyectos.</p>
              )}
              {stats.byProject.map((p) => {
                const total = (p.pending ?? 0) + (p.done ?? 0);
                const pct = total ? Math.round(((p.done ?? 0) / total) * 100) : 0;
                return (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="dot" style={{ background: p.color }} />
                    <span className="text-[13px] flex-1">{p.name}</span>
                    <span className="text-[11px] text-fg-subtle tabular-nums">{p.done}/{total}</span>
                    <div className="w-32 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] text-fg-muted tabular-nums w-9 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <ExportButton />
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, tint = "text-fg" }: { icon: any; label: string; value: number; tint?: string }) {
  return (
    <div className="bg-bg-subtle border border-border-subtle rounded-lg p-3.5">
      <div className="flex items-center justify-between text-fg-muted text-[12px]">
        <span>{label}</span>
        <Icon className={`w-3.5 h-3.5 ${tint}`} />
      </div>
      <div className="text-2xl font-semibold tabular-nums mt-1.5">{value}</div>
    </div>
  );
}
