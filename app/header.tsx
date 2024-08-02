"use client";

import Link from "next/link";
import { Menu, Package2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { HeaderActions } from "./header-actions";
import { Authenticated } from "convex/react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 md:px-6 shrink-0 gap-4 border-b bg-background">
      <Link
        href="/"
        className="hidden md:flex items-center gap-2 text-lg font-semibold md:text-base"
      >
        <Package2 className="h-6 w-6" />
        <span>Enthousiazein</span>
      </Link>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span>Enthousiazein</span>
            </Link>
            <Link
              href="#"
              className="hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              Page
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              Page
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              Page
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              Page
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <Authenticated>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/plan"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Plan
          </Link>
          <Link
            href="/creativity"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Creativity
          </Link>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search something..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
        </div>
      </Authenticated>
      <div className="flex items-center justify-end gap-4">
        <ModeToggle />
        <HeaderActions />
      </div>
    </header>
  );
}
