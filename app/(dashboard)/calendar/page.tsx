import { Topbar } from "@/components/topbar";
import { MonthView } from "@/components/calendar/month-view";
import { listTasks } from "@/lib/actions/tasks";

export default async function CalendarPage() {
  const tasks = await listTasks({ scope: "all" });
  const withDates = tasks.filter((t) => t.dueDate);
  return (
    <>
      <Topbar title="Calendario" subtitle={`${withDates.length} con fecha`} />
      <div className="flex-1 overflow-auto p-5">
        <MonthView tasks={withDates} />
      </div>
    </>
  );
}
