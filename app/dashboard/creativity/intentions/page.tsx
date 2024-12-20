"use client";

import clsx from "clsx";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

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
  const { intentions, error } = useIntentions(selectedTab);

  const allowIntentions = useQuery(api.intentions.getByStatus, {
    status: "allow",
  });
  const update = useMutation(api.intentions.update);

  useEffect(() => {
    if (allowIntentions && allowIntentions.length > 0) {
      const today = dayjs().startOf("day");

      const titheIntentions = allowIntentions.filter((intention) => {
        const updatedDate = dayjs(intention.updated).startOf("day");
        const daysDifference = today.diff(updatedDate, "days");
        return daysDifference > 3;
      });

      titheIntentions.forEach((intention) =>
        update({
          id: intention._id,
          status: "tithe",
        }),
      );
    }
  }, [allowIntentions, update]);

  return (
    <main className="w-full space-y-0 sm:space-y-8">
      <Tabs
        value={selectedTab}
        onValueChange={(value) => setSelectedTab(value)}
      >
        <div className="flex justify-between items-center mb-2">
          <TabsList className="">
            {TABS.map((tab, index) => (
              <TabsTrigger
                key={index}
                value={tab.value}
                className={clsx("w-[75px] text-base", {
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
  error,
  selectedTab,
}: {
  intentions: any;
  error: any;
  selectedTab: any;
}) {
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
