"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import SpNegSheet from "../components/sp-neg-sheet";

export default function StatementPage() {
  const { id } = useParams<{ id: Id<"statements"> }>();

  const statement = useQuery(api.statements.get, {
    statementId: id,
  });
  const removeStatement = useMutation(api.statements.remove);

  const router = useRouter();

  if (statement === undefined) {
    return <p>Loading...</p>;
  }

  if (statement === null) {
    return <p>Statement not found</p>;
  }

  const handleDone = async () => {
    await removeStatement({ id });
    router.push("/dashboard/me5");
  };

  return (
    <div className="h-full p-4 pt-0">
      <Card className="h-full overflow-hidden">
        <div className="m-3">
          <button
            className="hover:text-primary w-8 h-8 flex items-center justify-center"
            onClick={() => router.push("/dashboard/me5")}
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        <CardHeader className="pt-2 pb-6">
          <CardTitle className="text-4xl">
            {statement.text}
          </CardTitle>
          <CardDescription>
            List any resistance that arises when you think about this statement
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 mt-4">
          <SpNegSheet />
          <Button
            onClick={handleDone}
            size="lg"
            type="submit"
            variant="destructive"
            className="done-button"
          >
            Done
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
