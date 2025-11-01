"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { CloseModalButton } from "../../../components/close-modal-button";
import { EditTemplateForm } from "../../../components/edit-template-form";

export default function InterceptedEditPage() {
  const { id } = useParams<{ id: string }>();
  const template = useQuery(
    api.schedules.get,
    id ? { scheduleId: id as Id<"schedules"> } : "skip"
  );

  return (
    <Sheet defaultOpen>
      <SheetContent
        side="right"
        className="w-full sm:w-[540px] md:w-[600px] lg:w-[700px] flex flex-col"
      >
        <SheetHeader className="flex-none border-b pb-4">
          <SheetTitle>Edit Template</SheetTitle>
          <SheetDescription>
            Make changes to &quot;{template?.name}&quot; template here.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {template && (
            <EditTemplateForm
              template={{
                id: template._id as string,
                name: template.name ?? '',
                description: template.description ?? '',
              }}
            />
          )}
        </div>

        <SheetFooter className="flex-none border-t pt-4">
          <CloseModalButton />
          <Button type="submit" form="edit-template-form">
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
