"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import CreateIntentionDialog from "../components/create-intention-dialog";
import IntentionsTable from "../components/intentions-table";
import { useIntentions } from "../hooks/use-intentions";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Define the type for TabType
type TabType = { readonly value: string; readonly label: string };

// Ensure TABS is typed correctly
const TABS: TabType[] = [
  { value: "to_tithe", label: "Tithe" },
  { value: "draft", label: "Draft" },
  { value: "allowing", label: "Allow" },
  { value: "done", label: "Done" },
  { value: "all", label: "All" },
] as const;

export default function IntentionsPage() {
  const [selectedTab, setSelectedTab] = useState(TABS[0].value);
  const { intentions, isLoading, error } = useIntentions(selectedTab);
  const checkAllowingIntentions = useMutation(
    api.intentions_handler.checkAllowingIntentions,
  );

  useEffect(() => {
    checkAllowingIntentions();
  }, [checkAllowingIntentions]);

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
          <TabsList className="grid grid-cols-5 gap-2">
            {TABS.map((tab, index) => (
              <TabsTrigger
                key={index}
                value={tab.value}
                className="w-full"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <CreateIntentionDialog />
        </div>

        <Card>
          <CardHeader>
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
