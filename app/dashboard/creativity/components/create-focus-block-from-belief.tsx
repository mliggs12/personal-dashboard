"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

interface CreateFocusBlockFromBeliefProps {
  belief: Doc<"beliefs">;
}

export default function CreateFocusBlockFromBelief({ belief }: CreateFocusBlockFromBeliefProps) {
  const [isLoading, setIsLoading] = useState(false);
  const createFocusBlock = useMutation(api.focusBlocks.create);
  const updateBelief = useMutation(api.beliefs.update);
  const router = useRouter();
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      setIsLoading(true);

      // Create a new focus block with the belief as the starting statement
      const focusBlockId = await createFocusBlock({
        startStatement: belief.title,
        endStatement: "I feel free and empowered", // Default end statement
      });

      // Mark the belief as done
      await updateBelief({
        beliefId: belief._id,
        status: "done",
      });

      toast({
        title: "Focus Block Created",
        description: "A new focus block has been created from your belief.",
        duration: 3000,
      });

      // Navigate to the new focus block
      router.push(`/dashboard/creativity/focus-blocks/${focusBlockId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create focus block.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isLoading || belief.status === "done"}
      className="ml-2 p-1 h-6 text-xs"
    >
      {isLoading ? "Creating..." : "Create Focus Block"}
    </Button>
  );
}
