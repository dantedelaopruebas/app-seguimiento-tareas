import { Topbar } from "@/components/topbar";
import { TaskList } from "@/components/tasks/task-list";
import { listAllCompleted } from "@/lib/actions/tasks";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { TaskRow } from "@/components/tasks/task-row";
import { CheckCircle2 } from "lucide-react";
import type { Task } from "@/lib/db/schema";

export default async function CompletedPage() {
  const tasks = await listAllCompleted(30);

  const groups = new Map<string, Task[]>();
  for (const t of tasks) {
    const d = t.completedAt ? new Date(t.completedAt) : new Date();
    const key = isToday(d) ? "Hoy" : isYesterday(d) ? "Ayer" : format(d, "EEEE d 'de' MMMM", { locale: es });
    const arr = groups.get(key) ?? [];
    arr.push(t);
    groups.set(key, arr);
  }

  return (
    <>
      <Topbar title="Completadas" subtitle={`${tasks.length} en los últimos 30 días`} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-fg-subtle">
              <div className="w-12 h-12 rounded-full bg-bg-surface border border-border-subtle grid place-items-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-[13px]">Aún no has completado nada. Empieza marcando tu primera tarea.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(groups.entries()).map(([label, items]) => (
                <section key={label}>
                  <h3 className="text-[11px] uppercase tracking-wider text-fg-subtle px-2.5 mb-1 capitalize">{label}</h3>
                  <div>{items.map((t) => <TaskRow key={t.id} task={t} />)}</div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
