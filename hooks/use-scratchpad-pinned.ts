"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "scratchpad-pinned";

export function useScratchpadPinned() {
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setTimeout(() => {
        setIsPinned(stored === "true");
      }, 0);
    }

    // Listen for storage changes to sync across components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setIsPinned(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom event for same-tab updates
    const handleCustomStorageChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsPinned(stored === "true");
      }
    };

    window.addEventListener("scratchpad-pinned-change", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("scratchpad-pinned-change", handleCustomStorageChange);
    };
  }, []);

  const togglePinned = () => {
    const newValue = !isPinned;
    setIsPinned(newValue);
    localStorage.setItem(STORAGE_KEY, String(newValue));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("scratchpad-pinned-change"));
  };

  return { isPinned, togglePinned };
}

