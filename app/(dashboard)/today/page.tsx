import { Topbar } from "@/components/topbar";
import { QuickAdd } from "@/components/tasks/quick-add";
import { TaskList } from "@/components/tasks/task-list";
import { CompletedSection } from "@/components/tasks/completed-section";
import { listTasks, listCompletedToday } from "@/lib/actions/tasks";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function TodayPage() {
  const [tasks, completedToday] = await Promise.all([
    listTasks({ scope: "today" }),
    listCompletedToday(),
  ]);
  return (
    <>
      <Topbar title="Hoy" subtitle={`${format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}${completedToday.length ? ` · ${completedToday.length} hechas` : ""}`} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          <QuickAdd />
          <TaskList tasks={tasks} emptyMessage="No hay nada pendiente para hoy. 🌿" />
          <CompletedSection tasks={completedToday} />
        </div>
      </div>
    </>
  );
}
