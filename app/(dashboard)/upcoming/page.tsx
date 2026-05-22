import { Topbar } from "@/components/topbar";
import { QuickAdd } from "@/components/tasks/quick-add";
import { TaskList } from "@/components/tasks/task-list";
import { CompletedSection } from "@/components/tasks/completed-section";
import { listTasks, listCompletedToday } from "@/lib/actions/tasks";

export default async function UpcomingPage() {
  const [tasks, completedToday] = await Promise.all([
    listTasks({ scope: "next7" }),
    listCompletedToday(),
  ]);
  return (
    <>
      <Topbar title="Próximos 7 días" subtitle={`${tasks.length} tareas`} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          <QuickAdd />
          <TaskList tasks={tasks} />
          <CompletedSection tasks={completedToday} />
        </div>
      </div>
    </>
  );
}
