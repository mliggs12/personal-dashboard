import { CalendarDays, EllipsisVertical } from "lucide-react";

import { Button } from "@/components/ui/button";

import MonthCalendar from "../_components/month-calendar";

export default function CalendarPage() {
  return (
    <div className="calendar-page max-w-md mx-auto h-full border">
      <div className="header h-[49px] w-full flex justify-between items-center border-b-2">
        <div className="logo">
          <Button size="default" variant="ghost" className="text-xl font-normal">Calendar</Button>
        </div>
        <div className="menu-items flex items-center">
          <Button variant="ghost" className="[&_svg]:size-7">
            <CalendarDays />
          </Button>
          <Button variant="ghost" className="[&_svg]:size-7">
            <EllipsisVertical />
          </Button>
        </div>
      </div>
      <div className="content flex w-full justify-center">
        <MonthCalendar />
      </div>
    </div>
  )
}