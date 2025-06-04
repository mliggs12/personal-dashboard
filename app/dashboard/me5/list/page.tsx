"use client";

import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";

export default function Statements() {
  const statements = useQuery(api.statements.todayMindDumpStatements);

  const router = useRouter();

  return (
    <main className="h-full p-4 pt-0">
      <Card className="h-full overflow-hidden">
        <div className="m-3">
          <button
            className="hover:text-primary w-8 h-8 flex items-center justify-center"
            onClick={() => router.push("/dashboard/me5")}
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        <CardHeader className="pt-2 py-2">
          <CardTitle className="text-4xl">
            Mind Dump Statements
          </CardTitle>
          <CardDescription>
            Select the statement that is bothering you the most.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">


            {statements === null || statements && statements.length === 0 && (
              <div className="py-12 flex flex-col justify-center items-center gap-8">
                <h2 className="text-2xl">You have no statements for today</h2>
              </div>
            )}

            <ul className="space-y-2 my-6">
              {statements === undefined ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <li key={i}>
                    <Skeleton className="h-[28px] w-1/4 rounded-sm" />
                  </li>
                ))
              ) : (
                statements.map((statement) => (
                  <li key={statement._id}>
                    <Link
                      href={`/dashboard/me5/list/${statement._id}`}
                      className="text-xl hover:text-primary"
                    >
                      {statement.text}
                    </Link>
                  </li>
                ))
              )}
            </ul>

          </div>
        </CardContent>
      </Card>
    </main>
  );
}


