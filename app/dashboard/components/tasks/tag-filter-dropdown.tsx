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
  excludedTagIds: Id<"tags">[];
  onExcludedTagsChange: (tagIds: Id<"tags">[]) => void;
}

export function TagFilterDropdown({
  excludedTagIds,
  onExcludedTagsChange,
}: TagFilterDropdownProps) {
  const tags = useQuery(api.tags.list);

  const toggleTag = (tagId: Id<"tags">) => {
    if (excludedTagIds.includes(tagId)) {
      onExcludedTagsChange(excludedTagIds.filter((id) => id !== tagId));
    } else {
      onExcludedTagsChange([...excludedTagIds, tagId]);
    }
  };

  const hasActiveFilters = excludedTagIds.length > 0;

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8",
            hasActiveFilters && "text-primary bg-primary/10"
          )}
        >
          <Filter className="h-4 w-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
              {excludedTagIds.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Hide tasks with tags
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tags.map((tag) => (
          <DropdownMenuCheckboxItem
            key={tag._id}
            checked={excludedTagIds.includes(tag._id)}
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
        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-xs"
              onClick={() => onExcludedTagsChange([])}
            >
              Clear filters
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
