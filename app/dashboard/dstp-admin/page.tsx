"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import LinkSection from "./components/link-section";
import { dstpAdminLinks } from "./data";

export default function DSTPAdminPage() {
  const currentUser = useQuery(api.users.current);

  if (currentUser === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div>Loading...</div>
      </div>
    );
  }

  if (
    currentUser === null ||
    ![process.env.NEXT_PUBLIC_USER_1, process.env.NEXT_PUBLIC_USER_2].includes(
      currentUser._id,
    )
  ) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Unauthorized</h1>
          <p className="text-muted-foreground">
            You do not have access to this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col flex-1 overflow-y-auto overflow-x-hidden w-full">
      <div className="flex flex-col items-start px-8 py-6 w-full gap-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">DSTP Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and access DSTP company resources and tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {dstpAdminLinks.map((section, index) => (
            <LinkSection key={index} section={section} />
          ))}
        </div>

        {dstpAdminLinks.every((section) => section.links.length === 0) && (
          <div className="w-full text-center py-12 text-muted-foreground">
            <p>No links configured yet. Add links to the data file to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

