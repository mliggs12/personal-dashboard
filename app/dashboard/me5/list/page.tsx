"use client";

import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import router from "next/router";

import { api } from "@/convex/_generated/api";

export default function Statements() {
  const statements = useQuery(api.statements.todayMindDumpStatements);

  const router = useRouter();

  return (
    <main className="w-full flex flex-col gap-4">
      <div className="m-2">
        <button
          className="hover:text-primary w-8 h-8 flex items-center justify-center"
          onClick={() => router.push("/dashboard/me5")}
        >
          <ArrowLeft size={20} />
        </button>
      </div>
      <div className="flex flex-col gap-2 mx-6">
        <h1 className="text-4xl font-bold">Mind Dump Results</h1>
        <h2 className="text-lg text-gray-400">
          Select the Statement that is bothering you most
        </h2>
        {statements?.length === 0 && (
          <div className="py-12 flex flex-col justify-center items-center gap-8">
            <h2 className="text-2xl">You have no statements for today</h2>
          </div>
        )}
      </div>

      {statements && statements.length > 0 && (
        <div className="mx-6">
          <ul className="space-y-2">
            {statements.map((statement) => (
              <li key={statement._id}>
                <Link
                  href={`/dashboard/me5/list/${statement._id}`}
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


