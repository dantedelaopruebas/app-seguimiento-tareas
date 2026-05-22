import { Sidebar } from "@/components/sidebar";
import { CommandPalette } from "@/components/command-palette";
import { Toaster } from "@/components/toast";
import { listProjects } from "@/lib/actions/projects";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const projects = await listProjects();
  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar projects={projects} />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      <CommandPalette projects={projects} />
      <Toaster />
    </div>
  );
}
