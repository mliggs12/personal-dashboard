"use client";

import { useQuery } from "convex/react";
import { Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface TagFilterDropdownProps {
  includedTagIds: Id<"tags">[];
  onIncludedTagsChange: (tagIds: Id<"tags">[]) => void;
  includeNoTags: boolean;
  onIncludeNoTagsChange: (value: boolean) => void;
  filteredOutTaskCount: number;
}

export function TagFilterDropdown({
  includedTagIds,
  onIncludedTagsChange,
  includeNoTags,
  onIncludeNoTagsChange,
  filteredOutTaskCount,
}: TagFilterDropdownProps) {
  const tags = useQuery(api.tags.list);

  const toggleTag = (tagId: Id<"tags">) => {
    if (includedTagIds.includes(tagId)) {
      onIncludedTagsChange(includedTagIds.filter((id) => id !== tagId));
    } else {
      onIncludedTagsChange([...includedTagIds, tagId]);
    }
  };

  // Consider filters active unless all tags are selected AND no tags are included
  const allTagsSelected = tags && includedTagIds.length === tags.length;
  const hasActiveFilters = !(allTagsSelected && includeNoTags);
  // Show badge when filters are active (even if count is 0)
  const showBadge = hasActiveFilters;

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
        >
          <Filter className="h-4 w-4" />
          {showBadge && (
            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center leading-none">
              {filteredOutTaskCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Show tasks with tags
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={includeNoTags}
          onCheckedChange={(checked) => onIncludeNoTagsChange(checked ?? false)}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-border bg-muted" />
            <span>No tags</span>
          </div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {tags.map((tag) => (
          <DropdownMenuCheckboxItem
            key={tag._id}
            checked={includedTagIds.includes(tag._id)}
            onCheckedChange={() => toggleTag(tag._id)}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              <span>{tag.name}</span>
            </div>
          </DropdownMenuCheckboxItem>
        ))}
        <>
          <DropdownMenuSeparator />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            onClick={() => {
              const allSelected = tags && includedTagIds.length === tags.length && includeNoTags;
              if (allSelected) {
                // If all tags selected and no tags included, clear filters
                onIncludedTagsChange([]);
                onIncludeNoTagsChange(false);
              } else {
                // Select all tags and include no tags
                onIncludedTagsChange(tags.map((tag) => tag._id));
                onIncludeNoTagsChange(true);
              }
            }}
          >
            {tags && includedTagIds.length === tags.length && includeNoTags ? "Clear filters" : "Select all"}
          </Button>
        </>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
