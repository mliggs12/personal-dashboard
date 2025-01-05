"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import * as React from "react";
import { useState } from "react";

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
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";

export function GlobalCommandDialog() {
  const [open, setOpen] = React.useState(false);
  const [searchText, setSearchText] = useState("");
  const searchResults = useQuery(api.notes.search, { query: searchText }) || [];

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Search{" "}
        <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </p>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
      >
        <CommandInput asChild>
          <Input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search notes..."
          />
        </CommandInput>
        <CommandList>
          <ul className="p-4 space-y-4">
            {searchResults.map((searchResult) => (
              <li
                key={searchResult._id}
                onClick={() => setOpen(false)}
              >
                <Link
                  href={`/dashboard/notes/${searchResult._id}`}
                  className="hover:cursor-pointer hover:text-primary"
                >
                  {searchResult.title}
                </Link>
              </li>
            ))}
          </ul>
        </CommandList>
      </CommandDialog>
    </>
  );
}
