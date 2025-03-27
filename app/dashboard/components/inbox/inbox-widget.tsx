import { useQuery } from "convex/react";
import * as React from "react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api"
import { timestampToShortDateTime } from "@/lib/date.utils";

export default function InboxWidget() {
  const recentRecords = useQuery(api.inboxRecords.recent);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Inbox - Recently Added</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {/* TODO: Test this loading state */}
            {recentRecords === undefined ? (
              Array.from({ length: 5 }).map((_, index) => (
                <li key={index} className="flex justify-between w-full">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </li>
              ))
            ) : (
              recentRecords?.map((record) => (
                <li key={record._id} className="flex justify-between w-full">
                  <div>{record.content}</div>
                  <div>{timestampToShortDateTime(record._creationTime)}</div>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
