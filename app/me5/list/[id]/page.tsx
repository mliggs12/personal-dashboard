"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import SpNegSheet from "./sp-neg-sheet";
import { useState } from "react";
import AddWhyInput from "./add-why-input";
import { useRouter } from "next/navigation";

export default function StatementPage() {
  const [whyStatements, setWhyStatements] = useState<string[]>([]);
  const { id } = useParams<{ id: Id<"statements"> }>();
  const statement = useQuery(api.statements.get, {
    statementId: id,
  });

  const createBelief = useMutation(api.beliefs.create);
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

  return (
    <Card className="min-w-[750px] min-h-[1100px]">
      <CardHeader>
        <CardTitle className="text-4xl hover:text-primary">
          {statement.text}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <div className="space-y-12">
            <div className="space-y-2">
              <h4 className="text-3xl">Discover root belief</h4>
              <ul className="space-y-1">
                {whyStatements.map((statement, index) => (
                  <li
                    key={index}
                    className="text-xl ml-3 hover:text-primary"
                  >
                    {statement}
                  </li>
                ))}
              </ul>
              <AddWhyInput onAddWhy={handleAddWhy} />
            </div>
            <div>
              <div className="space-y-2">
                <h4 className="text-3xl">Create a new belief</h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const title = formData.get("title") as string;
                    const newBeliefId = await createBelief({
                      title,
                      status: "active",
                    });
                    await removeStatement({ id: id });
                    // Go to the new belief detail page
                    router.push(`/release/beliefs/${newBeliefId}`);
                  }}
                >
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter belief title"
                    className="border p-2 rounded w-full"
                    required
                  />
                  <button
                    type="submit"
                    className="mt-2 p-2 bg-blue-500 text-white rounded"
                  >
                    Create Belief
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
