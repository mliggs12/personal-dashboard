"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";

export default function Dashboard() {
  const { isAuthenticated } = useConvexAuth();

  return <>{isAuthenticated ? redirect("/dashboard") : redirect("/login")}</>;
}
