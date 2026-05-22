import type { Task } from "@/lib/db/schema";
import { TaskRow } from "./task-row";
import { Inbox } from "lucide-react";

export function TaskList({ tasks, emptyMessage = "Nada por aquí. Disfruta el silencio." }: { tasks: Task[]; emptyMessage?: string }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-fg-subtle">
        <div className="w-12 h-12 rounded-full bg-bg-surface border border-border-subtle grid place-items-center mb-3">
          <Inbox className="w-5 h-5" />
        </div>
        <p className="text-[13px]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {tasks.map((t) => <TaskRow key={t.id} task={t} />)}
    </div>
  );
}
