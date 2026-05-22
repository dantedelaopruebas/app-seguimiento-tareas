import { Topbar } from "@/components/topbar";
import { TaskList } from "@/components/tasks/task-list";
import { listTasks } from "@/lib/actions/tasks";

export default async function OverduePage() {
  const tasks = await listTasks({ scope: "overdue" });
  return (
    <>
      <Topbar title="Vencidas" subtitle={`${tasks.length} tareas atrasadas`} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <TaskList tasks={tasks} emptyMessage="Cero atrasos. Bien hecho." />
        </div>
      </div>
    </>
  );
}
