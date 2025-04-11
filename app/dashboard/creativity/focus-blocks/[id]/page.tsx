"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { FocusBlock } from "../../components/focus-block";

export default function FbPage() {
  const { id } = useParams<{ id: Id<"focusBlocks"> }>();

  const fb = useQuery(api.focusBlocks.get, { id: id as Id<"focusBlocks"> });
  const statements = useQuery(api.focusBlocks.getStatements, { id: id as Id<"focusBlocks"> });

  return (
    <div>
      <FocusBlock
        focusBlock={fb}
        statements={statements}
      />
    </div>
  );
}
