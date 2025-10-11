"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

export default function BeliefsWidget() {
  const recentBeliefs = useQuery(api.beliefs.activeBeliefsToday);

  return (
    <Card className="hidden md:block w-full">
      <CardHeader className="flex flex-row items-center">
        <CardTitle>Beliefs created today</CardTitle>
        <Button
          asChild
          size="lg"
          className="ml-auto gap-1"
        >
          <Link href="/release/beliefs">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-8">
        {recentBeliefs && recentBeliefs.length > 0 ? (
          recentBeliefs.map((belief) => (
            <Link
              key={belief._id}
              href={`/release/beliefs/${belief._id}`}
              className="flex items-center gap-4 cursor-pointer"
            >
              <div className="grid gap-1">
                <p className="text-lg font-medium leading-none">
                  {belief.title}
                </p>
              </div>
              <div className="ml-auto text-sm font-medium whitespace-nowrap">
                {new Date(belief._creationTime).toLocaleTimeString()}
              </div>
            </Link>
          ))
        ) : (
          <p>No beliefs found</p>
        )}
      </CardContent>
    </Card>
  );
}
