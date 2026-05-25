import { Sidebar } from "@/components/sidebar";
import { CommandPalette } from "@/components/command-palette";
import { Toaster } from "@/components/toast";
import { TaskEditor } from "@/components/tasks/task-editor";
import { DataProvider } from "@/components/data/provider";
import { listProjects } from "@/lib/actions/projects";
import { listDashboardTasks } from "@/lib/actions/tasks";
import { getSupabaseServer } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Una sola pasada: usuario + proyectos + tareas (pendientes + últimas 30 días
  // completadas). Esto se ejecuta una vez al entrar a la app; las navegaciones
  // entre vistas (Hoy / Todas / Tablero / Calendario / Historial reciente) no
  // disparan más consultas — se filtra desde el store del navegador.
  const [supabase, projects, tasks] = await Promise.all([
    getSupabaseServer(),
    listProjects(),
    listDashboardTasks(),
  ]);
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <DataProvider
      initialTasks={tasks}
      initialProjects={projects}
      initialUserEmail={user?.email ?? null}
    >
      <div className="flex h-screen bg-bg overflow-hidden">
        <Sidebar projects={projects} userEmail={user?.email ?? null} />
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        <CommandPalette projects={projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))} />
        <TaskEditor projects={projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))} />
        <Toaster />
      </div>
    </DataProvider>
  );
}
