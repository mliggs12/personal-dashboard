import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type StatusType = "tithe" | "draft" | "allow" | "done" | "all";
type TabType = { value: StatusType; label: string };

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
    intentions: result?.sort((a, b) => a.updatedAt! - b.updatedAt!),
    error: result instanceof Error ? result : null,
  };
}
