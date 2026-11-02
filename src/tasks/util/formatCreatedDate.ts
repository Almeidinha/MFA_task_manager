export function formatCreatedDate(timestamp: number): string {
  // A fixed timezone prevents server/browser hydration differences.
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(timestamp);
}
