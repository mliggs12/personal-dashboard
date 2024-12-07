"use client";

import { LoadingButton } from "@/components/loading-button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteBeliefButton({ beliefId }: { beliefId: Id<"beliefs"> }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const deleteBelief = useMutation(api.beliefs.remove);
  const router = useRouter();

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
    >
      <AlertDialogTrigger>
        <Button
          className="absolute -top-3 -right-3"
          variant={"destructive"}
          size="icon"
        >
          <Trash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this belief?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your belief cannot be recovered after it has been deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <LoadingButton
            onClick={() => {
              setIsLoading(true);
              deleteBelief({
                beliefId,
              })
                .then(() => {
                  router.push("/release/beliefs");
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }}
            isLoading={isLoading}
            loadingText="Deleting..."
          >
            Delete
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
