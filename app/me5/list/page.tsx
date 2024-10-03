"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";

export default function Statements() {
  const statements = useQuery(api.statements.todayMindDumpStatements);

  return (
    <main className="w-full space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">What&apos;s bothering me</h1>
      </div>
      <div>
        <h2 className="text-2xl font-semibold">
          Select the thing that is bothering you most in the moment
        </h2>
      </div>

      {statements?.length === 0 && (
        <div className="py-12 flex flex-col justify-center items-center gap-8">
          <h2 className="text-2xl">You have no statements for today</h2>
        </div>
      )}

      {statements && statements.length > 0 && (
        <div className="flex gap-12">
          <ul className="space-y-2">
            {statements.map((statement) => (
              <li key={statement._id}>
                <Link
                  href={`/me5/list/${statement._id}`}
                  className="text-xl hover:text-primary dark:hover:text-primary"
                >
                  {statement.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
