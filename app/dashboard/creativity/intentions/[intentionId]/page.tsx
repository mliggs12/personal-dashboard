"use client";

import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";

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
import { DeleteIntentionButton } from "../../components/delete-intention-button";
import { EmotionSelectForm } from "../../components/emotion-select-form";
import IntentionNotes from "../../components/intention-notes";
import IntentionStatusSelect from "../../components/intention-status-select";
import IntentionTitle from "../../components/intention-title";
import StatementItem from "../../components/statement-item";
import { AddTaskWrapper } from "../../components/tasks/add-task-button";
import TaskList from "../../components/tasks/task-list";

export default function IntentionPage() {
  const { intentionId } = useParams<{ intentionId: Id<"intentions"> }>();
  const intention = useQuery(api.intentions.get, {
    intentionId,
  });
  const emotions = useQuery(api.emotions.list);
  const tasks = useQuery(api.tasks.getByIntention, {
    intentionId,
  });
  const statements = useQuery(api.statements.byIntentionId, {
    intentionId,
  });
  const beliefs = useQuery(api.beliefs.byIntention, {
    intentionId,
  });
  const completeStatement = useMutation(api.statements.complete);
  const unCompleteStatement = useMutation(api.statements.unComplete);
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
    <div className="flex flex-col h-full px-2">
      <div className="flex-1 relative">
        <div className="absolute inset-0 overflow-y-auto">
          <Card>
            <DeleteIntentionButton intentionId={intention._id} />
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
                  <ul className="space-y-1">
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
                  <ul className="space-y-1">
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
                    // <p className="text-xl">{emotion.label}</p>
                    <h4 className="text-2xl">
                      Feeling: <span>{emotion.label}</span>
                    </h4>
                  ) : (
                    <h4 className="text-2xl flex gap-2">
                      Feeling:{" "}
                      <div>
                        <EmotionSelectForm intentionId={intention._id} />
                      </div>
                    </h4>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl">Release Limiting Beliefs</h4>
                  <ul className="space-y-1">
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
        {/* <div className="w-full">
          <IntentionStatusSelect intention={intention} />
        </div> */}
      </div>
      <Toaster />
    </div>
  );
}
