import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

export function useIntentions(selectedTab: string) {
  const query =
    selectedTab === "all" ? api.intentions.list : api.intentions.getByStatus;
  const result = useQuery(
    query,
    selectedTab === "all"
      ? {} // Use an empty object instead of undefined
      : {
          status: selectedTab as "tithe" | "draft" | "allow" | "done",
        },
  );

  return {
    intentions: result?.sort((a, b) => a.updated! - b.updated!),
    error: result instanceof Error ? result : null,
  };
}
