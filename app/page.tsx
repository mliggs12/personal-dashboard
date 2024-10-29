"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";

export default function Dashboard() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : isAuthenticated ? (
        redirect("/dashboard")
      ) : (
        redirect("/login")
      )}
    </>
  );
}
