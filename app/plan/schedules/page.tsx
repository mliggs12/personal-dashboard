import { preloadQuery } from "convex/nextjs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import CreateScheduleButton from "./create-schedule-button";
import SchedulesTable from "./schedules-table";

export default async function SchedulesPage() {
  const preloadedSchedules = await preloadQuery(api.schedules.list);

  if (preloadedSchedules === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger
              value="archived"
              className="hidden sm:flex"
            >
              Archived
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <CreateScheduleButton />
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Schedules</CardTitle>
              <CardDescription>
                Manage your schedules and templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchedulesTable preloadedSchedules={preloadedSchedules} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
