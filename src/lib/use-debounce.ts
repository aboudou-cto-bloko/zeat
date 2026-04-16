import { useState, useEffect } from "react";

/**
 * useDebounce — delays updating the returned value until `delay` ms have
 * passed without the input changing.
 *
 * Used for search inputs to avoid creating/destroying Convex subscriptions
 * on every keystroke (each subscription is a WebSocket message + server query).
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
