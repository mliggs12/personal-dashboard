"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import AddWhyInput from "./add-why-input";

export default function StatementPage() {
  const [whyStatements, setWhyStatements] = useState<string[]>([]);
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

  const handleAddWhy = (newStatement: string) => {
    setWhyStatements((prevStatements) => [...prevStatements, newStatement]);
  };

  const handleDone = async () => {
    if (whyStatements.length === 0) {
      return;
    }
    router.push("/dashboard/me5/list");
    await removeStatement({ id });
  };

  return (
    <div className="h-full p-4 pt-0">
      <Card className="h-full overflow-hidden">
        <div className="m-3">
          <button
            className="hover:text-primary w-8 h-8 flex items-center justify-center"
            onClick={() => router.push("/dashboard/me5/list")}
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        <CardHeader className="pt-2 py-2">
          <CardTitle className="text-4xl">
            {statement.text}
          </CardTitle>
          <CardDescription>
            List any resistance that arises when you think about this statement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <ul className="space-y-2 my-6">
              {whyStatements.map((statement, index) => (
                <li
                  key={index}
                  className="ml-1 text-xl hover:text-primary"
                >
                  {statement}
                </li>
              ))}
              <AddWhyInput onAddWhy={handleAddWhy} />
            </ul>
          </div>
          <Button
            className="done-button absolute bottom-12 left-12"
            onClick={handleDone}
            disabled={whyStatements.length === 0}
            size="lg"
            type="submit"
            variant="outline"
          >
            Done
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
