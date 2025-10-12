"use client"

import { useState } from "react"
import { useMutation } from "convex/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"

interface TypeButtonProps {
  entryId: string
  entryType: string
}


export default function TypeButton({ entryId, entryType }: TypeButtonProps) {
  const [open, setOpen] = useState(false)
  // Set the type of the entry
  // Developer Note: There is a global relationship between convex docs and state. In order to update a property of a doc, you need to update the state and have the doc id to update the property. This breeds the idea of a context that holds the state of the app and the docs. This context can be used to update the state and docs in a single operation. This context can be passed to any client component that needs access to the state and be able to update the db doc if needed.
  const [type, setType] = useState<string>(entryType)

  const updateType = useMutation(api.journalEntries.update)

  const handleChangeType = async (type: "none" | "highlight" | "task" | "idea", id: string) => {
    setType(type)
    await updateType({ type, id: id as Id<"journalEntries"> })
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="w-6 shrink-0">
          <Button size="icon"
            className={cn(
              "w-6 h-6 rounded-full bg-gray-600 hover:bg-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0",
              open && "w-5 h-5",
              type === "highlight" && "bg-orange-600 hover:bg-orange-500",
              type === "task" && "bg-green-600 hover:bg-green-500",
              type === "idea" && "bg-blue-600 hover:bg-blue-500",
            )} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right">
        <DropdownMenuItem onClick={() => handleChangeType("none", entryId)} className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gray-600" />
          <span>None</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChangeType("highlight", entryId)} className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-orange-600" />
          <span>Highlight</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChangeType("task", entryId)} className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-green-600" />
          <span>Do later</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChangeType("idea", entryId)} className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-600" />
          <span>New idea</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}