"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

import AddBeliefInput from "../../components/add-belief-input";
import AddStatementInput from "../../components/add-statement-input";
import CreateFocusBlockInput from "../../components/create-focus-block-input";
import { DeleteIntentionButton } from "../../components/delete-intention-button";
import { EmotionSelectForm } from "../../components/emotion-select-form";
import FocusBlocksList from "../../components/focus-blocks-list";
import IntentionNotes from "../../components/intention-notes";
import IntentionStatusSelect from "../../components/intention-status-select";
import IntentionTitle from "../../components/intention-title";
import StatementItem from "../../components/statement-item";
import { AddTaskWrapper } from "../../components/tasks/add-task-button";
import TaskList from "../../components/tasks/task-list";

export default function IntentionPage() {
  const { id } = useParams<{ id: string }>();
  const intention = useQuery(api.intentions.get, { id: id as Id<"intentions"> });
  const emotions = useQuery(api.emotions.list);
  const tasks = useQuery(api.tasks.getByIntention, { intentionId: id as Id<"intentions"> });
  const statements = useQuery(api.statements.byIntentionId, { intentionId: id as Id<"intentions"> });
  const beliefs = useQuery(api.beliefs.byIntention, { intentionId: id as Id<"intentions"> });
  const updateBelief = useMutation(api.beliefs.update);

  if (
    intention === undefined ||
    emotions === undefined ||
    tasks === undefined ||
    statements === undefined ||
    beliefs === undefined
  ) {
    return <p>Loading...</p>;
  }

  if (intention === null) {
    return <p>Intention not found</p>;
  }

  const emotion = emotions?.find((e) => e._id === intention.emotionId);

  return (
    <div className="flex h-full px-2 gap-2">
      <div className="flex-1 relative">
        <div className="absolute inset-0 overflow-y-auto">
          <Card>
            <DeleteIntentionButton id={intention._id} />
            <CardHeader>
              <IntentionTitle intention={intention} />
              <CardDescription>
                {intention.updated ? (
                  <p>
                    Updated at: {new Date(intention.updated).toLocaleString()}
                  </p>
                ) : (
                  <p>
                    Created:{" "}
                    {new Date(intention._creationTime).toLocaleString()}
                  </p>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-2xl">What?</h4>
                  <ul className="space-y-1 ml-2">
                    {statements
                      ?.filter((statement) => statement.type === "what")
                      .map((whatStatement, index) => (
                        <StatementItem
                          key={index}
                          statement={whatStatement}
                        />
                      ))}
                  </ul>
                  <AddStatementInput
                    intention={intention}
                    type="what"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl">Why?</h4>
                  <ul className="space-y-1 ml-2">
                    {statements
                      ?.filter((statement) => statement.type === "why")
                      .map((whyStatement, index) => (
                        <StatementItem
                          key={index}
                          statement={whyStatement}
                        />
                      ))}
                  </ul>
                  <AddStatementInput
                    intention={intention}
                    type="why"
                  />
                </div>
                <div>
                  {emotion ? (
                    <h4 className="text-xl">
                      Feeling: <span>{emotion.label}</span>
                    </h4>
                  ) : (
                    <h4 className="text-xl flex gap-2">
                      Feeling:{" "}
                      <div>
                        <EmotionSelectForm intentionId={intention._id} />
                      </div>
                    </h4>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl">Release Limiting Beliefs</h4>
                  <ul className="space-y-1 ml-2">
                    {beliefs.map((belief, index) => (
                      <li
                        key={index}
                        onClick={() =>
                          belief.status === "done"
                            ? updateBelief({
                              beliefId: belief._id,
                              status: "active",
                            })
                            : updateBelief({
                              beliefId: belief._id,
                              status: "done",
                            })
                        }
                        className={cn(
                          "cursor-pointer hover:text-primary",
                          belief.status === "done" &&
                          "line-through text-foreground/50",
                        )}
                      >
                        {belief.title}
                      </li>
                    ))}
                  </ul>
                  <AddBeliefInput intention={intention} />
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl">Create Focus Block</h4>
                  <div>
                    <CreateFocusBlockInput intention={intention} />
                  </div>
                </div>

                <FocusBlocksList intentionId={intention._id} />
                <div className="space-y-4">
                  <h4 className="text-3xl">Notes</h4>
                  <IntentionNotes intention={intention} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-3xl">Tasks</h4>
                  <div className="flex flex-col border-y-2">
                    <TaskList items={tasks ?? []} />
                  </div>
                  <AddTaskWrapper intentionId={intention._id} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="w-48">
        <IntentionStatusSelect intention={intention} />
      </div>
      <Toaster />
    </div>
  );
}
