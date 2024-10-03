"use client";

import Image from "next/image";
import Link from "next/link";
import { Authenticated } from "convex/react";
import { Menu, Package2, Search, Brain } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "/public/logo.png";

import { HeaderActions } from "./header-actions";
import CreateNoteInput from "@/components/create-note-input";

const tools: { title: string; href: string }[] = [
  { title: "ME-5", href: "/me5" },
  { title: "SN", href: "/me5/list" },
  { title: "Water", href: "/water" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-4 md:px-6 shrink-0 gap-4 border-b bg-background">
      <Link
        href="/"
        className="hidden md:flex items-center gap-2 text-lg font-semibold md:text-base"
      >
        <Brain className="h-6 w-6" />
        {/* <Image
          src={logo}
          alt="Enthousiazein logo"
        /> */}
        <span>Enthousiazein</span>
      </Link>
      <Authenticated>
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
                href="/"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Brain className="h-6 w-6" />
                <span>Enthousiazein</span>
              </Link>
              <Link
                href="/creativity"
                className="hover:text-primary dark:hover:text-primary"
              >
                Creativity
              </Link>
              <Link
                href="/plan"
                className="hover:text-primary dark:hover:text-primary"
              >
                Plan
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/creativity"
            className="transition-colors hover:text-primary"
          >
            Creativity
          </Link>
          <Link
            href="/plan"
            className="transition-colors hover:text-primary"
          >
            Plan
          </Link>
          <Link
            href="/fv/tasks"
            className="transition-colors hover:text-primary"
          >
            Tasks
          </Link>
          <Link
            href="/release"
            className="transition-colors hover:text-primary"
          >
            Release
          </Link>
          <Link
            href="/interstitial"
            className="transition-colors hover:text-primary"
          >
            Interstitial
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul>
                    {tools.map((tool, index) => (
                      <li
                        key={index}
                        className="w-full"
                      >
                        <Link
                          href={tool.href}
                          legacyBehavior
                          passHref
                          key={tool.href}
                        >
                          <NavigationMenuLink
                            className={navigationMenuTriggerStyle()}
                          >
                            {tool.title}
                          </NavigationMenuLink>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          {/* <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search something..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form> */}
          <CreateNoteInput />
        </div>
      </Authenticated>
      <div className="flex items-center justify-end gap-4">
        <ModeToggle />
        <HeaderActions />
      </div>
    </header>
  );
}
