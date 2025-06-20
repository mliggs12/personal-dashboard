"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function StatusDropdown({
  status,
  onStatusChange,
}: {
  status: string,
  onStatusChange: (status: "today" | "deadline" | "backlog") => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="text-xs"
          size="sm"
          variant="outline">{status.charAt(0).toUpperCase() + status.slice(1)}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="">
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={value => onStatusChange(value as "today" | "deadline" | "backlog")}
        >
          <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="deadline">Deadline</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="backlog">Backlog</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}