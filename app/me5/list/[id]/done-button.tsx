import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { updateStatus } from "@/convex/beliefs";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
export default function DoneButton({ belief }: { belief: Doc<"beliefs"> }) {
  const updateStatus = useMutation(api.beliefs.updateStatus);

  const handleClick = async () => {
    await updateStatus({ beliefId: belief._id, status: "done" });
  };

  return (
    <Link href="/me5/list">
      <Button onClick={handleClick}>Done</Button>
    </Link>
  );
}
