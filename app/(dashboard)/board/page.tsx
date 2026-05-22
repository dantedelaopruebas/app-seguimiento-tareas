import { Topbar } from "@/components/topbar";
import { Kanban } from "@/components/board/kanban";
import { listTasks } from "@/lib/actions/tasks";

export default async function BoardPage() {
  const tasks = await listTasks({ scope: "all" });
  return (
    <>
      <Topbar title="Tablero" subtitle="Arrastra entre columnas" />
      <div className="flex-1 overflow-hidden p-5">
        <Kanban tasks={tasks} />
      </div>
    </>
  );
}
