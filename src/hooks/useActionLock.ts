"use client";

import { useCallback, useRef } from "react";

/** Prevents duplicate concurrent action submissions (spam click / race). */
export function useActionLock() {
  const lockedRef = useRef(false);

  const tryLock = useCallback((): boolean => {
    if (lockedRef.current) return false;
    lockedRef.current = true;
    return true;
  }, []);

  const unlock = useCallback(() => {
    lockedRef.current = false;
  }, []);

  const isLocked = useCallback(() => lockedRef.current, []);

  return { tryLock, unlock, isLocked };
}
