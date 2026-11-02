import { initTRPC, TRPCError, type inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import { PAGE_SIZE, taskInput } from "@/models/task";
import { taskStore, type TaskStore } from "./taskStore";

const t = initTRPC.context<{ store: TaskStore }>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      // Avoid showing Zod's JSON diagnostic as an end-user message.
      message:
        error.cause instanceof z.ZodError
          ? (error.cause.issues[0]?.message ?? "Please check your input.")
          : shape.message,
    };
  },
});

const taskId = z.object({ id: z.string().uuid("This task ID is invalid.") });
const missingTask = (): TRPCError =>
  new TRPCError({
    code: "NOT_FOUND",
    message: "This task no longer exists. Return to your tasks and try again.",
  });

export const appRouter = t.router({
  tasks: t.router({
    list: t.procedure
      .input(
        z
          .object({
            limit: z.number().int().min(1).max(50).default(PAGE_SIZE),
            cursor: z.number().int().positive().optional(),
          })
          .default({ limit: PAGE_SIZE }),
      )
      .query(({ ctx, input }) => ctx.store.list(input)),
    get: t.procedure.input(taskId).query(({ ctx, input }) => {
      const task = ctx.store.get(input.id);
      if (!task) throw missingTask();
      return task;
    }),
    create: t.procedure
      .input(taskInput)
      .mutation(({ ctx, input }) => ctx.store.create(input)),
    update: t.procedure
      .input(taskInput.extend({ id: taskId.shape.id }))
      .mutation(({ ctx, input }) => {
        const { id, ...fields } = input;
        const task = ctx.store.update(id, fields);
        if (!task) throw missingTask();
        return task;
      }),
    delete: t.procedure.input(taskId).mutation(({ ctx, input }) => {
      if (!ctx.store.delete(input.id)) throw missingTask();
      return { id: input.id };
    }),
  }),
});

export const createContext = (): { store: TaskStore } => ({ store: taskStore });
export type AppRouter = typeof appRouter;
export type TaskPage = inferRouterOutputs<AppRouter>["tasks"]["list"];
