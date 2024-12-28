"use client";

import { useQuery } from "convex/react";
import Link from "next/link";

import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

import CreateBeliefButton from "./create-belief-button";

export default function BeliefsPage() {
  const beliefs = useQuery(api.beliefs.list);

  if (beliefs === undefined) {
    return <p>Loading...</p>;
  }

  if (beliefs && beliefs.length === 0) {
    return (
      <div className="flex flex-col h-full justify-center items-center border-2 border-dashed border-gray-300 rounded-lg p-4 gap-4">
        <h2 className="text-xl">You have no active beliefs</h2>
        <CreateBeliefButton />
      </div>
    );
  }

  return (
    <main className="px-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-base md:text-2xl font-semibold">Beliefs</h1>
        <CreateBeliefButton />
      </div>
      <div className="flex-1 overflow-auto">
        <ul className="space-y-2">
          {beliefs.map((belief) => (
            <li key={belief._id}>
              <Link
                href={`/dashboard/beliefs/${belief._id}`}
                className="cursor-pointer hover:text-primary"
              >
                {belief.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
