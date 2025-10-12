"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

interface CreateFocusBlockInputProps {
  intention?: Doc<"intentions">;
}

export default function CreateFocusBlockInput({ intention }: CreateFocusBlockInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [startStatement, setStartStatement] = useState("");
  const [endStatement, setEndStatement] = useState("");
  const [createdFocusBlockId, setCreatedFocusBlockId] = useState<Id<"focusBlocks"> | null>(null);
  const createFocusBlock = useMutation(api.focusBlocks.create);
  const { toast } = useToast();

  // Get the created focus block to display it
  const createdFocusBlock = useQuery(
    api.focusBlocks.get,
    createdFocusBlockId ? { id: createdFocusBlockId } : "skip"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startStatement.trim()) return;

    try {
      setIsLoading(true);

      // Create a new focus block with the input text as the starting statement
      const focusBlockId = await createFocusBlock({
        startStatement: startStatement.trim(),
        endStatement: endStatement.trim() || undefined,
        intentionId: intention?._id,
      });

      toast({
        title: "Focus Block Created",
        description: "A new focus block has been created. Click it to open.",
        duration: 3000,
      });

      // Clear the inputs
      setStartStatement("");
      setEndStatement("");

      // Store the created focus block ID to display it
      setCreatedFocusBlockId(focusBlockId);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create focus block.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Enter a limiting belief to release..."
            value={startStatement}
            onChange={(e) => setStartStatement(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !startStatement.trim()}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
        <Input
          placeholder="How do you want to feel instead? (optional)"
          value={endStatement}
          onChange={(e) => setEndStatement(e.target.value)}
          disabled={isLoading}
        />
      </form>

      {createdFocusBlock && (
        <div className="mt-2 p-2 border rounded-md">
          <p className="text-sm font-medium">Recently Created:</p>
          <Link
            href={`/dashboard/creativity/focus-blocks/${createdFocusBlockId}`}
            className="text-blue-500 hover:underline"
          >
            {createdFocusBlock.startStatement || "Untitled Focus Block"}
          </Link>
        </div>
      )}
    </div>
  );
}
