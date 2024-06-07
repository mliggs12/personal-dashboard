'use client'

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Unauthenticated, Authenticated } from "convex/react";

export default function Dashboard() {
  return (
    <main className="m-2">
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
      <Authenticated>
        <UserButton />
      </Authenticated>
    </main>
  );
}
