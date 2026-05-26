import { Sidebar } from "@/components/sidebar";
import { CommandPalette } from "@/components/command-palette";
import { Toaster } from "@/components/toast";
import { TaskEditor } from "@/components/tasks/task-editor";
import { DataProvider } from "@/components/data/provider";
import { listProjects } from "@/lib/actions/projects";
import { listDashboardTasks } from "@/lib/actions/tasks";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Una sola pasada para hidratar el store del cliente.
  const [projects, tasks] = await Promise.all([
    listProjects(),
    listDashboardTasks(),
  ]);

  return (
    <DataProvider initialTasks={tasks} initialProjects={projects}>
      <div className="flex h-screen bg-bg overflow-hidden">
        <Sidebar projects={projects} />
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        <CommandPalette projects={projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))} />
        <TaskEditor projects={projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))} />
        <Toaster />
      </div>
    </DataProvider>
  );
}
