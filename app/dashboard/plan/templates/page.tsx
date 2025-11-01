"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { api } from "@/convex/_generated/api";

import CreateTemplateDrawerDialog from "../components/create-template-drawer-dialog";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function TemplatesPage() {
  const templates = useQuery(api.schedules.getTemplates)

  if (templates === undefined) return <div>Loading...</div>

  return (
    <section className="h-full flex flex-col">
      <div className="header flex items-center justify-between px-1">
        <h1 className="text-lg md:text-2xl font-semibold">
          <span>Templates</span>
        </h1>
        <CreateTemplateDrawerDialog />
      </div>
      <div className="h-full flex flex-col">
        {templates.map((template) => (
          <Link
            key={template._id}
            href={`/templates/${template._id}/edit`}
            className="p-4 rounded-lg border hover:bg-muted transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
