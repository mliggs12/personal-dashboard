"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import DashboardPage from "./dashboard/page";
import LoginPage from "./login-page";

export default function Home() {
  return (
    <>
      <Unauthenticated>
        <LoginPage />
      </Unauthenticated>
      <Authenticated>
        <DashboardPage />
      </Authenticated>
    </>
  );
}
