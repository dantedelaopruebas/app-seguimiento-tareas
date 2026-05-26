"use client";

import { useEffect, useRef } from "react";
import { useData } from "./store";
import type { Task } from "@/lib/db/schema";

type ProjectLite = { id: string; name: string; color: string; icon: string; count: number };

export function DataProvider({
  initialTasks,
  initialProjects,
  initialUserEmail,
  children,
}: {
  initialTasks: Task[];
  initialProjects: ProjectLite[];
  initialUserEmail: string | null;
  children: React.ReactNode;
}) {
  const hydrate = useData((s) => s.hydrate);
  const didInit = useRef(false);

  // Hidratación inmediata en cliente con los datos del servidor.
  if (typeof window !== "undefined" && !didInit.current) {
    didInit.current = true;
    hydrate({ tasks: initialTasks, projects: initialProjects, userEmail: initialUserEmail });
  }

  // Re-hidratar cuando el layout server-side se vuelve a renderizar
  // (por ejemplo tras revalidatePath en una mutación).
  useEffect(() => {
    hydrate({ tasks: initialTasks, projects: initialProjects, userEmail: initialUserEmail });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTasks, initialProjects, initialUserEmail]);

  return <>{children}</>;
}
