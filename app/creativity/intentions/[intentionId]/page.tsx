"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { EmotionSelectForm } from "../../components/emotion-select-form";
import IntentionNotes from "../../components/intention-notes";
import AddWhyInput from "../../components/add-why-input";
import { DeleteIntentionButton } from "../../components/delete-intention-button";
import AddWhatInput from "../../components/add-what-input";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import IntentionStatusSelect from "../../components/intention-status-select";
import { AddTaskWrapper } from "../../components/tasks/add-task-button";
import { Toaster } from "@/components/ui/toaster";
import TaskList from "../../components/tasks/task-list";

export default function IntentionPage() {
  const { intentionId } = useParams<{ intentionId: Id<"intentions"> }>();
  const intention = useQuery(api.intentions.get, {
    intentionId: intentionId,
  });
  const emotions = useQuery(api.emotions.list);
  const tasks = useQuery(api.tasks.getByIntention, {
    intentionId,
  });

  if (intention === undefined || emotions === undefined) {
    return <p>Loading...</p>;
  }

  if (intention === null) {
    return <p>Intention not found</p>;
  }

  const emotion = emotions.find((e) => e._id === intention.emotionId);

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
            <CardTitle className="text-4xl hover:text-primary cursor-pointer">
              {intention.title}
            </CardTitle>
            <CardDescription>
              {intention.updatedAt ? (
                <p>
                  Updated at: {new Date(intention.updatedAt).toLocaleString()}
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
                  {intention.whatStatements?.map((statement, index) => (
                    <li
                      key={index}
                      className="text-xl ml-3 hover:text-primary cursor-pointer"
                    >
                      {statement}
                    </li>
                  ))}
                </ul>
                <AddWhatInput intention={intention} />
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl">Why?</h4>
                <ul className="space-y-1">
                  {intention.whyStatements?.map((statement, index) => (
                    <li
                      key={index}
                      className="text-xl ml-3 hover:text-primary cursor-pointer"
                    >
                      {statement}
                    </li>
                  ))}
                </ul>
                <AddWhyInput intention={intention} />
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
