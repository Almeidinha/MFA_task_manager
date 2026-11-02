import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import TaskForm from "@/tasks/components/TaskForm/TaskForm";
import { appRouter, createContext } from "@/server/router";

export const metadata: Metadata = { title: "Edit task" };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EditTask({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const caller = appRouter.createCaller(createContext());
  try {
    const task = await caller.tasks.get({ id });
    return <TaskForm task={task} />;
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}
