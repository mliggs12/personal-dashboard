"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function CommandPalette() {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [searchText, setSearchText] = useState("");

  const searchResults = useQuery(api.notes.search, { query: searchText }) || [];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (noteId: Id<"notes">) => {
    setOpen(false);
    router.push(`/dashboard/notes/${noteId}`);
  };

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Search{" "}
        <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <CommandShortcut>⌘K</CommandShortcut>
        </kbd>
      </p>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
      >
        <CommandInput
          value={searchText}
          onValueChange={setSearchText}
          placeholder="Search notes..."
        />
        <CommandList className="p-4 space-y-4">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {searchResults.map((searchResult) => (
              <CommandItem
                key={searchResult._id}
                onSelect={() => handleSelect(searchResult._id)}
                value={searchResult.title}
              >
                <Link href={`/dashboard/notes/${searchResult._id}`}>
                  {searchResult.title}
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

