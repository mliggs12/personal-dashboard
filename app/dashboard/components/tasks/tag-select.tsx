"use client";

import * as React from "react";
import { CheckIcon, GearIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { useQuery } from "convex/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

import { TagManagementDialog } from "../../tasks/components/tag-management-dialog";
import { TagBadge } from "./tag-badge";

interface TagSelectProps {
  selectedTagIds: Id<"tags">[];
  onTagsChange: (tagIds: Id<"tags">[]) => void;
  /** When true, only shows "Add tags" without displaying selected tags in trigger */
  compact?: boolean;
}

export function TagSelect({
  selectedTagIds,
  onTagsChange,
  compact = false,
}: TagSelectProps) {
  const tags = useQuery(api.tags.list);
  const [open, setOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const selectedTags =
    tags?.filter((tag) => selectedTagIds.includes(tag._id)) || [];

  const toggleTag = (tagId: Id<"tags">) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleManageTags = () => {
    setOpen(false); // Close the popover
    setSheetOpen(true); // Open the sheet
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 pl-0 justify-start text-base font-normal"
          >
            <PlusCircledIcon className="mr-2 h-4 w-4" />
            {!compact && selectedTags.length > 0 ? (
              <div className="flex gap-1 flex-wrap">
                {selectedTags.slice(0, 2).map((tag) => (
                  <TagBadge
                    key={tag._id}
                    name={tag.name}
                    color={tag.color}
                    size="sm"
                  />
                ))}
                {selectedTags.length > 2 && (
                  <Badge variant="secondary" className="rounded-sm px-1">
                    +{selectedTags.length - 2}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">Add tags</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {tags?.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag._id);
                  return (
                    <CommandItem
                      key={tag._id}
                      onSelect={() => toggleTag(tag._id)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                        style={{ borderColor: isSelected ? undefined : tag.color }}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {selectedTagIds.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onTagsChange([])}
                      className="justify-center text-center"
                    >
                      Clear all
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={handleManageTags}
                  className="flex items-center justify-center gap-1 text-muted-foreground"
                >
                  <GearIcon className="h-3 w-3" />
                  Manage tags
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <TagManagementDialog
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        showTrigger={false}
      />
    </>
  );
}
