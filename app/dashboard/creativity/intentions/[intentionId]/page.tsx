"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/app/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import AddStatementInput from "../../components/add-statement-input";
import { DeleteIntentionButton } from "../../components/delete-intention-button";
import { EmotionSelectForm } from "../../components/emotion-select-form";
import IntentionNotes from "../../components/intention-notes";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import { Toaster } from "@/app/components/ui/toaster";
import { cn } from "@/lib/utils";
import Link from "next/link";
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
  const completeStatement = useMutation(api.statements.complete);
  const unCompleteStatement = useMutation(api.statements.unComplete);

  if (intention === undefined) {
    return <p>Loading...</p>;
  }

  if (intention === null) {
    return <p>Intention not found</p>;
  }

  const emotion = emotions?.find((e) => e._id === intention.emotionId);

  return (
    <main className="w-full space-y-8">
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/creativity">Creativity</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/creativity/intentions">Intentions</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Intention Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex gap-8">
        <Card className="relative min-w-[750px] min-h-[1100px]">
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
                  Created: {new Date(intention._creationTime).toLocaleString()}
                </p>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-3xl">What?</h4>
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
                <h4 className="text-3xl">Why?</h4>
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
                  <h4 className="text-3xl">
                    Feeling:{" "}
                    <span className="hover:text-primary cursor-pointer">
                      {emotion.label}
                    </span>
                  </h4>
                ) : (
                  <h4 className="text-3xl flex gap-2">
                    Feeling:{" "}
                    <div className="">
                      <EmotionSelectForm intentionId={intention._id} />
                    </div>
                  </h4>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl">What is in the way?</h4>
                <ul className="space-y-1">
                  {statements
                    ?.filter((statement) => statement.type === "negative")
                    .map((negativeStatement, index) => (
                      <li
                        key={index}
                        onClick={() =>
                          negativeStatement.isComplete
                            ? unCompleteStatement({
                                id: negativeStatement._id,
                              })
                            : completeStatement({ id: negativeStatement._id })
                        }
                        className={cn(
                          "cursor-pointer text-xl",
                          negativeStatement.isComplete &&
                            "line-through text-foreground/50",
                        )}
                      >
                        {negativeStatement.text}
                      </li>
                    ))}
                </ul>
                <AddStatementInput
                  intention={intention}
                  type="negative"
                />
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
        <div className="w-full">
          <IntentionStatusSelect intention={intention} />
        </div>
      </div>
      <Toaster />
    </main>
  );
}
