import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createTaskStore } from "./taskStore";

let store = createTaskStore();
const caller = () => appRouter.createCaller({ store });

beforeEach(() => {
  store = createTaskStore();
});

describe("task API", () => {
  it("starts with an empty workspace", async () => {
    expect(await caller().tasks.list()).toEqual({
      items: [],
      nextCursor: null,
      total: 0,
    });
  });

  it("creates, reads, updates and deletes a task while preserving its identity", async () => {
    const api = caller();
    const task = await api.tasks.create({
      titulo: "  Plan a workshop  ",
      descricao: "  Draft an agenda  ",
    });
    expect(task).toMatchObject({
      titulo: "Plan a workshop",
      descricao: "Draft an agenda",
    });
    expect(task.id).toMatch(/^[a-f0-9-]{36}$/);
    expect(task.dataCriacao).toBeGreaterThan(0);
    expect(await api.tasks.get({ id: task.id })).toEqual(task);
    const updated = await api.tasks.update({
      id: task.id,
      titulo: "Run the workshop",
      descricao: "",
    });
    expect(updated).toEqual({
      ...task,
      titulo: "Run the workshop",
      descricao: "",
    });
    await api.tasks.delete({ id: task.id });
    expect((await api.tasks.list()).total).toBe(0);
    await expect(api.tasks.get({ id: task.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("allows a task without a description", async () => {
    expect(
      await caller().tasks.create({ titulo: "Review notes" }),
    ).toMatchObject({ titulo: "Review notes" });
  });

  it.each(["", " ", "\n\t", "x".repeat(121)])(
    "rejects invalid titles for create and update (%j)",
    async (titulo) => {
      const api = caller();
      const task = await api.tasks.create({ titulo: "Original" });
      await expect(api.tasks.create({ titulo })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
      await expect(
        api.tasks.update({ id: task.id, titulo }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect((await api.tasks.get({ id: task.id })).titulo).toBe("Original");
    },
  );

  it("rejects excessively long descriptions", async () => {
    await expect(
      caller().tasks.create({ titulo: "Valid", descricao: "x".repeat(2001) }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("reports meaningful errors for missing tasks and malformed IDs", async () => {
    const api = caller();
    const id = randomUUID();
    await expect(api.tasks.get({ id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(
      api.tasks.update({ id, titulo: "Missing" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(api.tasks.delete({ id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(api.tasks.get({ id: "invalid" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("paginates newest first without losing tasks when the cursor task is deleted", async () => {
    const api = caller();
    const tasks = [];
    for (let index = 0; index < 15; index++)
      tasks.push(await api.tasks.create({ titulo: `Task ${index}` }));
    const first = await api.tasks.list({ limit: 5 });
    expect(first.items.map((task) => task.id)).toEqual(
      tasks
        .slice(10)
        .reverse()
        .map((task) => task.id),
    );
    await api.tasks.delete({ id: first.items[4].id });
    await api.tasks.create({ titulo: "New task between requests" });
    const second = await api.tasks.list({
      cursor: first.nextCursor!,
      limit: 5,
    });
    const third = await api.tasks.list({
      cursor: second.nextCursor!,
      limit: 5,
    });
    expect([...second.items, ...third.items].map((task) => task.id)).toEqual(
      tasks
        .slice(0, 10)
        .reverse()
        .map((task) => task.id),
    );
    expect(third.nextCursor).toBeNull();
  });

  it("prevents mutations through references returned by the store", () => {
    const task = store.create({ titulo: "Original" });
    task.titulo = "Changed outside store";
    expect(store.get(task.id)?.titulo).toBe("Original");
  });

  it("rejects unbounded pagination", async () => {
    await expect(caller().tasks.list({ limit: 1000 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});

describe("tRPC HTTP adapter", () => {
  const request = (path: string, body: unknown) =>
    fetchRequestHandler({
      createContext: () => ({ store }),
      endpoint: "/api/trpc",
      req: new Request(`http://localhost/api/trpc/${path}`, {
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
      router: appRouter,
    });

  it("exposes the same CRUD router over HTTP", async () => {
    const response = await request("tasks.create", { titulo: "HTTP task" });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      result: { data: { titulo: "HTTP task" } },
    });
    expect((await caller().tasks.list()).total).toBe(1);
  });

  it("returns a readable validation error rather than raw Zod diagnostics", async () => {
    const response = await request("tasks.create", { titulo: "  " });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: {
        message: "Give your task a title.",
        data: { code: "BAD_REQUEST" },
      },
    });
  });
});
