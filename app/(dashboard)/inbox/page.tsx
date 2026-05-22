import { Topbar } from "@/components/topbar";
import { QuickAdd } from "@/components/tasks/quick-add";
import { TaskList } from "@/components/tasks/task-list";
import { CompletedSection } from "@/components/tasks/completed-section";
import { listTasks, listCompletedToday } from "@/lib/actions/tasks";

export default async function InboxPage() {
  const [tasks, completedToday] = await Promise.all([
    listTasks({ scope: "inbox" }),
    listCompletedToday(null),
  ]);
  return (
    <>
      <Topbar title="Inbox" subtitle={`${tasks.length} pendientes${completedToday.length ? ` · ${completedToday.length} hechas hoy` : ""}`} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          <QuickAdd />
          <TaskList tasks={tasks} emptyMessage="Inbox vacío. Captura algo arriba." />
          <CompletedSection tasks={completedToday} />
        </div>
      </div>
    </>
  );
}
