import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type StatusType = "to_tithe" | "draft" | "allowing" | "done" | "all";
type TabType = { value: StatusType; label: string };

export function useIntentions(selectedTab: string) {
  const query =
    selectedTab === "all" ? api.intentions.list : api.intentions.getByStatus;
  const result = useQuery(
    query,
    selectedTab === "all"
      ? {} // Use an empty object instead of undefined
      : {
          status: selectedTab as "to_tithe" | "draft" | "allowing" | "done",
        },
  );

  return {
    intentions: result?.sort((a, b) => a.updatedAt! - b.updatedAt!),
    isLoading: result === undefined,
    error: result instanceof Error ? result : null,
  };
}
