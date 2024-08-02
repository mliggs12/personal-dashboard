import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";

interface Intention {
  _id: Id<"intentions">;
  title: string;
  status: "active" | "archived" | "draft";
  whatStatements: string[];
  whyStatements: string[];
  emotionIds: Id<"emotions">[];
  notes: string;
}

interface IntentionPageProps {
  intention: Intention;
}

export default function IntentionPage({ intentionId }: IntentionPageProps) {
  const intention = fetchQuery(api.intentions.getIntention, {
    intentionId,
  });

  if (!intention) {
    return;
  }

  return (
    <div>
      <h1>{}</h1>
      <p>{intention?._id}</p>
    </div>
  );
}
