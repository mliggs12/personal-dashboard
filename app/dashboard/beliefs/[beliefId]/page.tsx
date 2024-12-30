"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import BeliefTitle from "../belief-title";
import { DeleteBeliefButton } from "../delete-belief-button";

export default function BeliefPage() {
  const { beliefId } = useParams<{ beliefId: Id<"beliefs"> }>();
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
      </div>
    </div>
  );
}
