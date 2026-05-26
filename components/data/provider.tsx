"use client";

import { useEffect, useRef } from "react";
import { useData } from "./store";
import type { Task } from "@/lib/db/schema";

type ProjectLite = { id: string; name: string; color: string; icon: string; count: number };

export function DataProvider({
  initialTasks,
  initialProjects,
  children,
}: {
  initialTasks: Task[];
  initialProjects: ProjectLite[];
  children: React.ReactNode;
}) {
  const hydrate = useData((s) => s.hydrate);
  const didInit = useRef(false);

  if (typeof window !== "undefined" && !didInit.current) {
    didInit.current = true;
    hydrate({ tasks: initialTasks, projects: initialProjects });
  }

  useEffect(() => {
    hydrate({ tasks: initialTasks, projects: initialProjects });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTasks, initialProjects]);

  return <>{children}</>;
}
