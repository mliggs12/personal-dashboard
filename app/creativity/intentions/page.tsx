"use client";

import moment from "moment-timezone";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import clsx from "clsx";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { api } from "@/convex/_generated/api";
import CreateIntentionDialog from "../components/create-intention-dialog";
import IntentionsTable from "../components/intentions-table";
import { useIntentions } from "../hooks/use-intentions";

type TabType = { readonly value: string; readonly label: string };

const TABS: TabType[] = [
  { value: "tithe", label: "Tithe" },
  { value: "draft", label: "Draft" },
  { value: "allow", label: "Allow" },
  { value: "done", label: "Done" },
  { value: "all", label: "All" },
];

const MOBILE_TABS = ["tithe", "all"];

export default function IntentionsPage() {
  const [selectedTab, setSelectedTab] = useState(TABS[0].value);
  const { intentions, isLoading, error } = useIntentions(selectedTab);

  const allowIntentions = useQuery(api.intentions.getByStatus, {
    status: "allow",
  });
  const updateIntentionStatus = useMutation(api.intentions.update);

  useEffect(() => {
    if (allowIntentions && allowIntentions.length > 0) {
      const fourDaysAgo = moment().subtract(4, "days");

      const titheIntentions = allowIntentions.filter((intention) =>
        moment(intention.updatedAt!).isBefore(fourDaysAgo),
      );

      if (titheIntentions.length > 0) {
        titheIntentions.forEach((intention) =>
          updateIntentionStatus({ id: intention._id, status: "tithe" }),
        );
      }
    }
  }, [allowIntentions, updateIntentionStatus]);

  return (
    <main className="w-full space-y-0 sm:space-y-8">
      <Breadcrumb className="hidden sm:flex">
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
            <BreadcrumbPage>
              {TABS.find((tab) => tab.value === selectedTab)?.label}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Tabs
        value={selectedTab}
        onValueChange={(value) => setSelectedTab(value)}
      >
        <div className="flex justify-between items-center mb-2">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TABS.map((tab, index) => (
              <TabsTrigger
                key={index}
                value={tab.value}
                className={clsx("w-full", {
                  hidden: !MOBILE_TABS.includes(tab.value) && true,
                  "sm:inline-flex": !MOBILE_TABS.includes(tab.value),
                })}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <CreateIntentionDialog />
        </div>

        <Card>
          <CardHeader className="pb-0 sm:p-6">
            <CardTitle>Intentions</CardTitle>
            <CardDescription>
              Manage your intentions to tithe and view their progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {TABS.map((tab, index) => (
              <TabsContent
                key={index}
                value={tab.value}
              >
                <IntentionsContent
                  intentions={intentions}
                  isLoading={isLoading}
                  error={error}
                  selectedTab={selectedTab}
                />
              </TabsContent>
            ))}
          </CardContent>
        </Card>
      </Tabs>
    </main>
  );
}

function IntentionsContent({
  intentions,
  isLoading,
  error,
  selectedTab,
}: {
  intentions: any;
  isLoading: boolean;
  error: any;
  selectedTab: any;
}) {
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!intentions || intentions.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            No intentions here
          </h3>
        </div>
      </div>
    );
  }
  return (
    <IntentionsTable
      intentions={intentions}
      selectedTab={selectedTab}
    />
  );
}
