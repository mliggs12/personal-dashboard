"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export default function MonthCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      showOutsideDays={false}
    />
  )
}
