"use client";

import { useMutation } from "convex/react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

import DynamicInput from "./_components/dynamic-input";

export default function Me5Page() {
  const clearStatements = useMutation(api.statements.clearMindDump);

  return (
    <div className="flex flex-col items-center h-full overflow-hidden">
      <h1 className="text-7xl font-bold my-8">Mind Dump</h1>
      <h2 className="text-2xl font-semibold mb-8">
        List anything and everything that is currently on your mind.
      </h2>
      <DynamicInput />
      <Button
        className="fixed bottom-12 right-12 text-base"
        onClick={() => clearStatements()}
        size="lg"
        variant="outline"
      >
        Clear
      </Button>
    </div>
  );
}
