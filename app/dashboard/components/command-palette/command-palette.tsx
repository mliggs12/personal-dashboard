"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Book, Droplets, HeartPulse, Home, ListTodo, StickyNote, Target } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";

export default function CommandPalette() {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [searchText, setSearchText] = useState("");
  const [showInboxInput, setShowInboxInput] = useState(false);
  const [showWaterInput, setShowWaterInput] = useState(false);
  const [inboxText, setInboxText] = useState("");
  const [waterAmount, setWaterAmount] = useState("16");

  const { toast } = useToast();

  const searchResults = useQuery(api.notes.search, { query: searchText }) || [];

  const addInboxRecord = useMutation(api.inboxRecords.create);
  const addWaterEntry = useMutation(api.waterLogEntries.create);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey) && !open) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "k" && (e.metaKey || e.ctrlKey) && open) {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "i" && (e.metaKey || e.ctrlKey) && open) {
        e.preventDefault();
          setShowInboxInput((show) => !show);
          setShowWaterInput(false); // Close water input when toggling inbox
      } else if (e.key === "l" && (e.metaKey || e.ctrlKey) && open) {
        e.preventDefault();
        setShowWaterInput((show) => !show);
        setShowInboxInput(false); // Close inbox input when toggling water
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
    setShowInboxInput(false);
    toast({
      title: "Added to inbox",
      duration: 1500,
    });
  }

  async function handleWaterAdd(amount: string) {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    await addWaterEntry({ amount: numericAmount });
    setWaterAmount("16");
    setOpen(false);
    setShowWaterInput(false);
    toast({
      title: "Water logged",
      description: `${numericAmount} oz added`,
      duration: 1500,
    });
  }

  const handleInboxInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInboxAdd(inboxText);
    }
  };

  const handleWaterInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleWaterAdd(waterAmount);
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
            setShowWaterInput(false);
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
        ) : showWaterInput ? (
          <div className="p-4 space-y-2">
            <Label htmlFor="water">Log Water Intake</Label>
            <Input
              type="number"
              id="water"
              placeholder="Amount in oz..."
              className="w-full p-2 border rounded"
              value={waterAmount}
              onChange={(e) => setWaterAmount(e.target.value)}
              onKeyDown={handleWaterInputKeyDown}
              autoFocus
              min="0"
              step="0.5"
            />
            <p className="text-sm text-muted-foreground">Enter amount in ounces (e.g., 16)</p>
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
                    <kbd>I</kbd>
                  </div>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowWaterInput(true)}>
                  <Droplets className="w-4 h-4 mr-1" />
                  <span>Log Water</span>
                  <div className="space-x-1">
                    <kbd>⌘</kbd>
                    <kbd>L</kbd>
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

