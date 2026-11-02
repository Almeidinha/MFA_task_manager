"use client";

import { createTRPCClient, httpBatchLink, TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/server/router";

export const trpc = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "/api/trpc" })],
});

export function errorMessage(error: unknown): string {
  if (error instanceof TRPCClientError) {
    return error.data?.code
      ? error.message
      : "We couldn't reach the server. Please try again.";
  }
  return "Something went wrong. Please try again.";
}
