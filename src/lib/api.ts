"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// Generic API fetch helper
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || error.message || "API Error");
  }
  return res.json();
}

// Hook similar to trpc.xxx.useQuery
export function useApiQuery<T>(
  url: string | null,
  options?: { enabled?: boolean; staleTime?: number }
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const enabled = options?.enabled !== false;

  const refetch = useCallback(async () => {
    if (!url) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiFetch<T>(url);
      setData(result);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (enabled && url) {
      refetch();
    }
  }, [enabled, url, refetch]);

  return { data, isLoading, error, refetch };
}

// Hook similar to trpc.xxx.useMutation
export function useApiMutation<TInput = any, TOutput = any>(
  url: string,
  options?: {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: Error) => void;
    method?: string;
  }
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (input?: TInput) => {
      setIsPending(true);
      setError(null);
      try {
        const result = await apiFetch<TOutput>(url, {
          method: options?.method || "POST",
          body: input ? JSON.stringify(input) : undefined,
        });
        options?.onSuccess?.(result);
        return result;
      } catch (e: any) {
        setError(e);
        options?.onError?.(e);
        throw e;
      } finally {
        setIsPending(false);
      }
    },
    [url, options?.onSuccess, options?.onError, options?.method]
  );

  return { mutate, isPending, error };
}

// Convenience export
export { apiFetch };
