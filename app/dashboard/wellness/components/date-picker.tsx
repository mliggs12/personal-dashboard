"use client"

import { useState } from "react"
import dayjs from "dayjs"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({
  date,
  onSelect
}: {
  date: Date,
  onSelect: (date: Date) => void;
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {date ? dayjs(date).format("MM/DD/YYYY") : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              onSelect(date!)
              setOpen(false)
            }}
          />
          <div className="flex items-center justify-end p-3 bg-secondary/25">
            <Button
              className="font-normal"
              size="sm"
              onClick={() => {
                onSelect(new Date())
                setOpen(false)
              }}
            >
              Today
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
