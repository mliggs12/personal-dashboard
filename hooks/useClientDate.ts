"use client";

import { startTransition,useEffect, useState } from "react";

import { getUserTimezone } from "@/lib/date.utils";
import dayjs from "@/lib/dayjs.config";

/**
 * Custom hook for client-side date handling in Next.js
 * 
 * Prevents hydration mismatches by only calculating dates after client hydration.
 * Returns the user's timezone and "today" date in that timezone.
 * 
 * @returns {Object} { isClient: boolean, timezone: string, today: string }
 * 
 * @example
 * ```tsx
 * const { isClient, timezone, today } = useClientDate();
 * 
 * if (!isClient) {
 *   return <Skeleton />;
 * }
 * 
 * const tasks = useQuery(api.tasks.todayTasks, { date: today });
 * ```
 */
export function useClientDate() {
  const [isClient, setIsClient] = useState(false);
  const [timezone, setTimezone] = useState<string>("America/Denver");
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    // Mark as client-side after hydration and calculate timezone-aware date
    startTransition(() => {
      setIsClient(true);

      // Get user's timezone from browser (using centralized utility)
      const userTimezone = getUserTimezone();
      setTimezone(userTimezone);
      // Calculate today's date in user's timezone
      const todayDate = dayjs().tz(userTimezone).format("YYYY-MM-DD");
      setToday(todayDate);
    });
  }, []);

  return {
    isClient,
    timezone,
    today,
  };
}

