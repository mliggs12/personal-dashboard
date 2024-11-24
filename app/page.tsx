"use client";

import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import DashboardPage from "./dashboard/page";
import LoginPage from "./login-page";

export default function Home() {
  const { isLoading, isAuthenticated } = useStoreUserEffect();

  return (
    <>
      {isLoading ? (
        <>Loading...</>
      ) : isAuthenticated ? (
        <DashboardPage />
      ) : (
        <LoginPage />
      )}
    </>
  );
}
