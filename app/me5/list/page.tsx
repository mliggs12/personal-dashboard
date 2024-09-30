"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";

export default function Beliefs() {
  const beliefs = useQuery(api.beliefs.activeBeliefs);

  return (
    <main className="w-full space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Active Beliefs - Mind Dump</h1>
      </div>
      <div>
        <h2 className="text-2xl font-semibold">
          Select the thing that is bothering you most in the moment:
        </h2>
      </div>

      {beliefs?.length === 0 && (
        <div className="py-12 flex flex-col justify-center items-center gap-8">
          <h2 className="text-2xl">You have no active beliefs</h2>
        </div>
      )}

      {beliefs && beliefs.length > 0 && (
        <div className="flex gap-12">
          <ul className="space-y-2">
            {beliefs.map((belief) => (
              <li key={belief._id}>
                <Link
                  href={`/me5/list/${belief._id}`}
                  className="text-xl hover:text-primary dark:hover:text-primary"
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
