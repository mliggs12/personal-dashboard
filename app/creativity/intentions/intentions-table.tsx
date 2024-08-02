"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import IntentionsTableRow from "./intentions-table-row";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface IntentionsTableProps {
  preloadedIntentions: Preloaded<typeof api.intentions.list>;
}

export default function IntentionsTable({
  preloadedIntentions,
}: IntentionsTableProps) {
  const intentions = usePreloadedQuery(preloadedIntentions);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Emotions</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {intentions.map((intention) => (
          <IntentionsTableRow
            key={intention._id}
            intention={intention}
          />
        ))}
      </TableBody>
    </Table>
  );
}
