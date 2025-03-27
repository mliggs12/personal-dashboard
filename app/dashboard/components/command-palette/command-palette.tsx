"use client";

import { useMutation, useQuery } from "convex/react";
import { Book, HeartPulse, Home, ListTodo, StickyNote, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function CommandPalette() {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [searchText, setSearchText] = useState("");
  const [showInboxInput, setShowInboxInput] = useState(false);
  const [inboxText, setInboxText] = useState("")

  const searchResults = useQuery(api.notes.search, { query: searchText }) || [];

  const addInboxRecord = useMutation(api.inboxRecords.create)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (open) {
          setShowInboxInput((show) => !show);
        } else {
          setOpen(true);
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  const handleNavigation = (path: string) => {
    setOpen(false);
    setSearchText("");
    router.push(path);
  };

  async function handleInboxAdd(content: string) {
    await addInboxRecord({ content });
    setInboxText("");
    setOpen(false);
    setShowInboxInput(false)
    // TODO: Add toast
  }

  const handleInboxInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInboxAdd(inboxText);
    }
  };

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Search{" "}
        <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <CommandShortcut>⌘</CommandShortcut>
          <CommandShortcut>K</CommandShortcut>
        </kbd>
      </p>

      <CommandDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setShowInboxInput(false);
          }
        }}
      >
        {showInboxInput ? (
          <div className="p-4 space-y-2">
            <Label htmlFor="inbox">Add to Inbox</Label>
            <Input
              type="text"
              id="inbox"
              placeholder="Write something..."
              className="w-full p-2 border rounded"
              value={inboxText}
              onChange={(e) => setInboxText(e.target.value)}
              onKeyDown={handleInboxInputKeyDown}
              autoFocus
            />
          </div>
        ) : (
          <>
            <CommandInput
              value={searchText}
              onValueChange={setSearchText}
              placeholder="Search notes or type a command"
            />
            <CommandList>
              <CommandGroup heading="Navigation">
                <CommandItem value="Go to Home" onSelect={() => handleNavigation("/dashboard")} className="gap-2">
                  <Home />
                  <span>Go to Home</span>
                  <CommandShortcut>G then H</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleNavigation("/dashboard/tasks")} className="gap-2">
                  <ListTodo />
                  <span>Go to Tasks</span>
                  <CommandShortcut>G then T</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleNavigation("/dashboard/notes")} className="gap-2">
                  <StickyNote />
                  <span>Go to Notes</span>
                  <CommandShortcut>G then N</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleNavigation("/dashboard/creativity/intentions")} className="gap-2">
                  <Target />
                  <span>Go to Intentions</span>
                  <CommandShortcut>G then I</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleNavigation("/dashboard/wellness")} className="gap-2">
                  <HeartPulse />
                  <span>Go to Wellness</span>
                  <CommandShortcut>G then W</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleNavigation("/dashboard/journal")} className="gap-2">
                  <Book />
                  <span>Go to Journal</span>
                  <CommandShortcut>G then J</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Notes">
                {searchResults.map((searchResult) => (
                  <CommandItem
                    key={searchResult._id}
                    onSelect={() => handleNavigation(`/dashboard/notes/${searchResult._id}`)}
                    value={searchResult.title}
                  >
                    <Link href={`/dashboard/notes/${searchResult._id}`}>
                      {searchResult.title}
                    </Link>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandEmpty>No results found.</CommandEmpty>
            </CommandList>
            <div className="footer border-t p-2">
              <div className="prose dark:prose-invert flex justify-end text-sm gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowInboxInput(true)}>
                  <span>Add to Inbox</span>
                  <div className="space-x-1">
                    <kbd>⌘</kbd>
                    <kbd>K</kbd>
                  </div>
                </Button>
              </div>
            </div>
          </>
        )}
      </CommandDialog>
    </>
  );
}

