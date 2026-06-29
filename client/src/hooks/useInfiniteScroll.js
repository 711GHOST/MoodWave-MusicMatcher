import { useEffect, useRef } from "react";

// Returns a ref to attach to a sentinel element near the end of a list.
// When it scrolls into view (and there's more to load), `onLoadMore` fires.
export default function useInfiniteScroll(onLoadMore, { hasMore, loading }) {
  const sentinelRef = useRef(null);
  const cbRef = useRef(onLoadMore);
  cbRef.current = onLoadMore;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) cbRef.current();
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  return sentinelRef;
}
