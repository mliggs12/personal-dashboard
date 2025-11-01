"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

import { EditTemplateForm } from "../../components/edit-template-form"

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>()
  const template = useQuery(api.schedules.get, { scheduleId: id as Id<"schedules"> })

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/templates"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Link>
        <h1 className="text-3xl font-bold">Edit Template</h1>
        <p className="text-muted-foreground">
          Editing &quot;{template?.name}&quot;
        </p>
      </div>

      <div className="space-y-6">
        {template && (
          <EditTemplateForm
            template={{
              id: template._id as string,
              name: template.name ?? '',
              description: template.description ?? '',
            }}
          />
        )}

        <div className="flex gap-4 pt-4 border-t">
          <Button type="submit" form="edit-template-form">
            Save Changes
          </Button>
          <Link href="/templates">
            <Button variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
