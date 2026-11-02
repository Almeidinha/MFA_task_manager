"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="empty-state error-page">
      <h1>Unable to load this page</h1>
      <p>Please try again or return to the task list.</p>
      <div className="dialog-actions">
        <Link className="button secondary" href="/">
          All tasks
        </Link>
        <button className="button primary" onClick={reset}>
          Try again
        </button>
      </div>
    </section>
  );
}
