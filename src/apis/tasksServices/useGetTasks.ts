"use client";

import { useCallback, useRef, useState } from "react";
import type { TaskPage } from "@/server/router";
import { PAGE_SIZE } from "@/models/task";
import { errorMessage, trpc } from "../trpcClient";

type TaskQuery = {
  error: string | undefined;
  isLoading: boolean;
  loadMore: () => Promise<void>;
  page: TaskPage;
  removeTask: (id: string) => void;
};

export default function useGetTasks(initialPage: TaskPage): TaskQuery {
  const [page, setPage] = useState(initialPage);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const inFlight = useRef(false);

  const loadMore = useCallback(async (): Promise<void> => {
    if (page.nextCursor === null || inFlight.current) return;
    inFlight.current = true;
    setIsLoading(true);
    setError(undefined);
    try {
      const next = await trpc.tasks.list.query({
        limit: PAGE_SIZE,
        cursor: page.nextCursor,
      });
      setPage((current) => ({
        ...next,
        items: [
          ...current.items,
          ...next.items.filter(
            (task) => !current.items.some((item) => item.id === task.id),
          ),
        ],
      }));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  }, [page.nextCursor]);

  const removeTask = (id: string): void => {
    setPage((current) => ({
      ...current,
      items: current.items.filter((task) => task.id !== id),
      total: Math.max(0, current.total - 1),
    }));
  };

  return { error, isLoading, loadMore, page, removeTask };
}
