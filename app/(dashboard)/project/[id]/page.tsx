import { Topbar } from "@/components/topbar";
import { QuickAdd } from "@/components/tasks/quick-add";
import { TaskList } from "@/components/tasks/task-list";
import { CompletedSection } from "@/components/tasks/completed-section";
import { listTasks, listCompletedToday } from "@/lib/actions/tasks";
import { db } from "@/lib/db/client";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = (
    await db.select().from(projects).where(eq(projects.id, id)).limit(1)
  )[0];
  if (!project) notFound();
  const [tasks, completedToday] = await Promise.all([
    listTasks({ projectId: id }),
    listCompletedToday(id),
  ]);
  const pending = tasks.filter((t) => t.status !== "done");

  return (
    <>
      <Topbar title={project.name} subtitle={`${pending.length} pendientes${completedToday.length ? ` · ${completedToday.length} hechas hoy` : ""}`} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="dot" style={{ background: project.color }} />
            <span className="text-[12px] text-fg-subtle uppercase tracking-wider">Proyecto</span>
          </div>
          <QuickAdd defaultProjectId={id} />
          <TaskList tasks={pending} emptyMessage="Sin tareas en este proyecto." />
          <CompletedSection tasks={completedToday} />
        </div>
      </div>
    </>
  );
}
