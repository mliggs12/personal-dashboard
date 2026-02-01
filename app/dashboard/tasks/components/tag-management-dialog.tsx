"use client";

import Link from "next/link";
import { ExternalLink, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { TagsContent } from "../../tags/tags-content";

interface TagManagementDialogProps {
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether to show the trigger button (default: true) */
  showTrigger?: boolean;
}

export function TagManagementDialog({
  open,
  onOpenChange,
  showTrigger = true,
}: TagManagementDialogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Tags className="h-4 w-4 mr-2" />
            Manage Tags
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Manage Tags</SheetTitle>
          <SheetDescription>
            Create, edit, and delete tags to organize your tasks.
            <Link
              href="/dashboard/tags"
              className="inline-flex items-center gap-1 ml-2 text-primary hover:underline"
            >
              Open full page
              <ExternalLink className="h-3 w-3" />
            </Link>
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
          <TagsContent />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
