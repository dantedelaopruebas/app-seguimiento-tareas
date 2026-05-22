import { Topbar } from "@/components/topbar";
import { QuickAdd } from "@/components/tasks/quick-add";
import { AllView } from "@/components/tasks/all-view";
import { CompletedSection } from "@/components/tasks/completed-section";
import { listTasks, listCompletedToday } from "@/lib/actions/tasks";

export default async function AllPage() {
  const [tasks, completedToday] = await Promise.all([
    listTasks({ scope: "all" }),
    listCompletedToday(),
  ]);
  return (
    <>
      <Topbar
        title="Todas"
        subtitle={`${tasks.length} pendientes${completedToday.length ? ` · ${completedToday.length} hechas hoy` : ""}`}
      />
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
          <QuickAdd />
          <AllView tasks={tasks} />
          <CompletedSection tasks={completedToday} />
        </div>
      </div>
    </>
  );
}
