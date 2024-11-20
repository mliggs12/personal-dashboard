import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function IntentionCell({
  intentionId,
}: {
  intentionId: Id<"intentions">;
}) {
  const intention = useQuery(api.intentions.get, { intentionId });
  return (
    <div className="max-w-[125px] truncate font-medium">{intention?.title}</div>
  );
}
