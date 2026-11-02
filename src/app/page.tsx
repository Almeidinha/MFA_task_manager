import { appRouter, createContext } from "@/server/router";
import TasksPage from "@/tasks/pages/TasksPage/TasksPage";

// Render current tasks on each request instead of caching the list.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const caller = appRouter.createCaller(createContext());
  const [initialPage, params] = await Promise.all([
    caller.tasks.list(),
    searchParams,
  ]);
  const notice =
    params.notice === "created"
      ? "Task created."
      : params.notice === "updated"
        ? "Task updated."
        : undefined;

  return (
    <TasksPage
      initialNotice={notice}
      initialPage={initialPage}
      key={JSON.stringify(initialPage)}
    />
  );
}
