"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { DeleteBeliefButton } from "./delete-belief-button";
import BeliefDescription from "./belief-description";
import BeliefTitle from "./belief-title";

export default function BeliefPage() {
  const { beliefId } = useParams<{ beliefId: Id<"beliefs"> }>();
  console.log(beliefId);
  const belief = useQuery(api.beliefs.get, {
    beliefId: beliefId,
  });

  if (!belief) {
    return null;
  }

  return (
    <div className="relative dark:bg-slate-800 bg-slate-200 rounded p-4 w-full">
      <DeleteBeliefButton beliefId={belief._id} />
      <div className="space-y-4">
        <BeliefTitle belief={belief} />
        <BeliefDescription belief={belief} />
      </div>
    </div>
  );
}
