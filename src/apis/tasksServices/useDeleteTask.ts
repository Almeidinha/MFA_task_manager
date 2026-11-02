"use client";

import { useRef, useState } from "react";
import { errorMessage, trpc } from "../trpcClient";

type DeleteTaskMutation = {
  deleteTask: (id: string) => Promise<boolean>;
  error: string | undefined;
  isLoading: boolean;
};

export default function useDeleteTask(): DeleteTaskMutation {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const inFlight = useRef(false);

  const deleteTask = async (id: string): Promise<boolean> => {
    if (inFlight.current) return false;
    inFlight.current = true;
    setIsLoading(true);
    setError(undefined);
    try {
      await trpc.tasks.delete.mutate({ id });
      return true;
    } catch (cause) {
      setError(errorMessage(cause));
      return false;
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  };

  return { deleteTask, error, isLoading };
}
