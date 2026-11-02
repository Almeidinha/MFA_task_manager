import { randomUUID } from "node:crypto";
import type { Task, TaskInput } from "@/models/task";

export type TaskStore = {
  create: (input: TaskInput) => Task;
  delete: (id: string) => boolean;
  get: (id: string) => Task | undefined;
  list: (input: { cursor?: number; limit: number }) => {
    items: Task[];
    nextCursor: number | null;
    total: number;
  };
  update: (id: string, input: TaskInput) => Task | undefined;
};

export function createTaskStore(): TaskStore {
  const records = new Map<string, { task: Task; sequence: number }>();
  let sequence = 0;

  return {
    list({ limit, cursor }: { limit: number; cursor?: number }) {
      // A monotonically increasing cursor stays valid when another task is deleted.
      const eligible = [...records.values()]
        .filter((record) => cursor === undefined || record.sequence < cursor)
        .sort((a, b) => b.sequence - a.sequence);
      const page = eligible.slice(0, limit);
      return {
        items: page.map(({ task }) => ({ ...task })),
        total: records.size,
        nextCursor: eligible.length > limit ? page.at(-1)!.sequence : null,
      };
    },
    get(id: string) {
      const record = records.get(id);
      return record ? { ...record.task } : undefined;
    },
    create(input: TaskInput) {
      const task: Task = {
        ...input,
        id: randomUUID(),
        dataCriacao: Date.now(),
      };
      records.set(task.id, { task, sequence: ++sequence });
      return { ...task };
    },
    update(id: string, input: TaskInput) {
      const record = records.get(id);
      if (!record) return undefined;
      record.task = { ...record.task, ...input };
      return { ...record.task };
    },
    delete(id: string) {
      return records.delete(id);
    },
  };
}

// Share the store across server modules and development reloads.
declare global {
  var taskManagerStore: TaskStore | undefined;
}
export const taskStore = (globalThis.taskManagerStore ??= createTaskStore());
