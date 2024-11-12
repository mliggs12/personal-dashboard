"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

const statuses = [
  { value: "tithe", label: "Tithe" },
  { value: "allow", label: "Allow" },
  { value: "done", label: "Done" },
  { value: "draft", label: "Draft" },
];

export default function IntentionStatusSelect({
  intention,
}: {
  intention: Doc<"intentions">;
}) {
  const [statusValue, setStatusValue] = useState(intention.status);
  const updateStatus = useMutation(api.intentions.update);

  const handleStatusChange = async (
    value: "draft" | "tithe" | "allow" | "done",
  ) => {
    await updateStatus({
      id: intention._id,
      status: value,
    });
    setStatusValue(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Select onValueChange={handleStatusChange}>
              <SelectTrigger
                id="status"
                aria-label="Select status"
              >
                <SelectValue
                  placeholder={
                    statuses.find((status) => status.value === statusValue)
                      ?.label || "Select a status"
                  }
                >
                  {statuses.find((status) => status.value === statusValue)
                    ?.label || "Select a status"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statuses.map(
                  (item, index) =>
                    item.value !== statusValue && (
                      <SelectItem
                        key={index}
                        value={item.value}
                      >
                        {item.label}
                      </SelectItem>
                    ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
