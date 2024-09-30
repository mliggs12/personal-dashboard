"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

export default function WorkButton() {
  const router = useRouter();
  const preselectedTasks = useQuery(api.tasks.preselectedTasks);
  if (preselectedTasks === undefined) {
    return <p>Loading...</p>;
  } else if (preselectedTasks && preselectedTasks.length > 0) {
    const topTaskId = preselectedTasks[0]._id;
  }

  return (
    <Button
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      onClick={() => {
        if (preselectedTasks && preselectedTasks.length > 0) {
          const topTaskId = preselectedTasks[0]._id;
          router.push(`/fv/work/${topTaskId}`);
        } else {
          router.push("/fv/work");
        }
      }}
    >
      Go to Work
    </Button>
  );
}
