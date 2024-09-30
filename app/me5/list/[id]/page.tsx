"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import BeliefDescription from "./belief-description";
import SpNegSheet from "./sp-neg-sheet";
import DoneButton from "./done-button";

export default function BeliefPage() {
  const { id } = useParams<{ id: Id<"beliefs"> }>();
  const belief = useQuery(api.beliefs.get, {
    beliefId: id,
  });

  if (belief === undefined) {
    return <p>Loading...</p>;
  }

  if (belief === null) {
    return <p>Belief not found</p>;
  }

  return (
    <Card className="min-w-[750px] min-h-[1100px]">
      <CardHeader>
        <CardTitle className="text-4xl hover:text-primary cursor-pointer">
          {belief.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <div className="space-y-12">
            <div className="flex gap-2">
              <SpNegSheet />
              <DoneButton belief={belief} />
            </div>
            <div className="space-y-4">
              <h4 className="text-3xl">Notes</h4>
              <BeliefDescription belief={belief} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
