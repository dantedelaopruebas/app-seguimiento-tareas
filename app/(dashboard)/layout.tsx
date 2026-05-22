import { Sidebar } from "@/components/sidebar";
import { CommandPalette } from "@/components/command-palette";
import { Toaster } from "@/components/toast";
import { TaskEditor } from "@/components/tasks/task-editor";
import { listProjects } from "@/lib/actions/projects";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const projects = await listProjects();
  const lite = projects.map((p) => ({ id: p.id, name: p.name, color: p.color }));
  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar projects={projects} />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      <CommandPalette projects={lite} />
      <TaskEditor projects={lite} />
      <Toaster />
    </div>
  );
}
