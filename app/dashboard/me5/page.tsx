"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";

import StatementInput from "./components/statement-input";

export default function Statements() {
  const statements = useQuery(api.statements.todayMindDumpStatements);
  const clear = useMutation(api.statements.clearMindDump);

  return (
    <main className="h-full p-4 pt-0">
      <Card className="relative h-full overflow-hidden pt-14">
        <CardHeader className="pt-2 pb-6">
          <CardTitle className="text-4xl">
            Mind Dump
          </CardTitle>
          <CardDescription>
            List some statements and select the one that is bothering you the most
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <div className="flex flex-col">
            <StatementInput type="mind_dump" />

            {statements === null || statements && statements.length === 0 && (
              <div className="py-12 flex flex-col justify-center items-center gap-8">
                <h2 className="text-2xl">You have no more statements</h2>
              </div>
            )}

            <div>
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
                        href={`/dashboard/me5/${statement._id}`}
                        className="text-xl hover:text-primary"
                      >
                        {statement.text}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

          </div>
        </CardContent>
        <Button
          className="absolute bottom-12 right-12 z-50 text-base"
          onClick={() => clear()}
          size="lg"
          variant="outline"
        >
          Clear
        </Button>
      </Card>
    </main>
  );
}
