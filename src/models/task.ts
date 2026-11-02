import { z } from "zod";

export const taskInput = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "Give your task a title.")
    .max(120, "Use 120 characters or fewer."),
  descricao: z
    .string()
    .trim()
    .max(2000, "Use 2,000 characters or fewer.")
    .optional(),
});

export type TaskInput = z.infer<typeof taskInput>;

export type Task = TaskInput & {
  id: string;
  dataCriacao: number;
};

export const PAGE_SIZE = 12;
