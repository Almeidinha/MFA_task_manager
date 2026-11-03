"use client";

import { useEffect, useRef, type RefObject } from "react";

export default function useInfiniteScroll(
  isEnabled: boolean,
  onLoadMore: () => Promise<void>,
): RefObject<HTMLDivElement | null> {
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !isEnabled || typeof IntersectionObserver === "undefined")
      return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void onLoadMore();
      },
      { rootMargin: "160px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isEnabled, onLoadMore]);

  return sentinel;
}
