import { useCallback, useRef, useState } from 'react';

export function useClipboard(timeoutMs = 1500) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const copy = useCallback(async (key: string, value: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(value);
    }

    setCopiedKey(key);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => setCopiedKey(null), timeoutMs);
  }, [timeoutMs]);

  return { copiedKey, copy };
}
