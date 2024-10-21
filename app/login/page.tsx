"use client";

import { LoginForm } from "@/components/login-form";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";

export default function Page() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <>
      {isAuthenticated ? (
        redirect("/dashboard")
      ) : (
        <div className="flex h-screen w-full items-center justify-center px-4">
          <LoginForm />
        </div>
      )}
    </>
  );
}
