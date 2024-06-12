'use client'

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Unauthenticated, Authenticated } from "convex/react";
import NewScheduleForm from "./components/plan/NewScheduleForm";
import ScheduleList from "./components/plan/ScheduleList";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Dashboard() {

  return (
    <main className="m-2">
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
      <Authenticated>
        <UserButton />
        <ModeToggle />
        {/* <ScheduleList /> */}
        {/* <NewScheduleForm /> */}
      </Authenticated>
    </main>
  );
}
