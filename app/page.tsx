"use client";

import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { redirect } from "next/navigation";
import LoginPage from "./login-page";

export default function LandingPage() {
  const { isLoading, isAuthenticated } = useStoreUserEffect();

  if (isLoading) {
    <div>Loading...</div>;
  }

  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return (
    <div>
      {/* <SignInButton /> */}
      <LoginPage />
    </div>
  );
}
