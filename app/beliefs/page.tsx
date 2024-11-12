"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import CreateBeliefButton from "./create-belief-button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function BeliefsPage() {
  const beliefs = useQuery(api.beliefs.activeBeliefs);

  return (
    <main className="w-full space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Beliefs</h1>
        <CreateBeliefButton />
      </div>

      {beliefs?.length === 0 && (
        <div className="py-12 flex flex-col justify-center items-center gap-8">
          <h2 className="text-2xl">You have no active beliefs</h2>
          <CreateBeliefButton />
        </div>
      )}

      {beliefs && beliefs.length > 0 && (
        <div className="flex gap-12">
          <ul className="space-y-2">
            {beliefs?.map((belief) => (
              <li
                key={belief._id}
                className={cn(
                  "text-base hover:text-cyan-300 dark:hover:text-cyan-100",
                  // {
                  //   "text-cyan-300": belief._id === beliefId,
                  // }, This is for when we can see an item in a dialog without leaving the page
                )}
              >
                <Link
                  href={`/beliefs/${belief._id}`}
                  className="text-xl"
                >
                  {belief.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
