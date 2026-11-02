"use client";

import { useRef, useState } from "react";
import type { TaskInput } from "@/models/task";
import { errorMessage, trpc } from "../trpcClient";

type SaveTaskMutation = {
  error: string | undefined;
  isLoading: boolean;
  saveTask: (input: TaskInput) => Promise<boolean>;
};

export default function useSaveTask(id?: string): SaveTaskMutation {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const inFlight = useRef(false);

  const saveTask = async (input: TaskInput): Promise<boolean> => {
    if (inFlight.current) return false;
    inFlight.current = true;
    setIsLoading(true);
    setError(undefined);
    try {
      if (id) await trpc.tasks.update.mutate({ id, ...input });
      else await trpc.tasks.create.mutate(input);
      return true;
    } catch (cause) {
      setError(errorMessage(cause));
      return false;
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  };

  return { error, isLoading, saveTask };
}
