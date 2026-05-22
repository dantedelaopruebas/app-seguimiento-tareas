import { Topbar } from "@/components/topbar";
import { HistoryView } from "@/components/history/history-view";
import { listProjects } from "@/lib/actions/projects";
import { listAllCompleted } from "@/lib/actions/tasks";

export default async function HistoryPage() {
  const [projects, initial] = await Promise.all([
    listProjects(),
    listAllCompleted(30),
  ]);
  return (
    <>
      <Topbar title="Historial" subtitle={`${initial.length} tareas completadas`} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <HistoryView
            initialTasks={initial}
            projects={projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))}
          />
        </div>
      </div>
    </>
  );
}
