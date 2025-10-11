"use client";

import Link from "next/link";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface FocusBlocksListProps {
  intentionId: Id<"intentions">;
}

export default function FocusBlocksList({ intentionId }: FocusBlocksListProps) {
  const focusBlocks = useQuery(api.focusBlocks.getByIntention, { intentionId });

  if (!focusBlocks || focusBlocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-2xl">Focus Blocks</h4>
      <ul className="space-y-1 ml-2">
        {focusBlocks.map((fb) => (
          <li key={fb._id} className="fb-list">
            <Link
              href={`/dashboard/creativity/focus-blocks/${fb._id}`}
              className="text-blue-500 hover:underline"
            >
              {fb.startStatement || "Untitled Focus Block"}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
