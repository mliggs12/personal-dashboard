import moment from "moment-timezone";
import CalendarScheduleView from "@/components/calendar/calendar-schedule-view";
import DashboardClient from "./components/dashboard-client";

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 p-4 md:p-8 md:pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl md:text-7xl font-bold tracking-tight">
            Dashboard
          </h2>
          <div className="hidden md:flex items-center justify-center">
            <p className="text-lg">
              {moment(Date.now())
                .tz("America/Denver")
                .format("MMMM D, YYYY [at] h:mm A")}
            </p>
          </div>
        </div>
        <div className="border-y-2 p-2 md:p-4 space-y-2 my-2 md:my-12">
          <h3 className="text-xl md:text-3xl font-semibold">
            Intention for my life
          </h3>
          <p className="text-lg md:text-2xl font-light italic">
            Alignment with True self
            <br />
            To live with a consistent, unconditional feeling of a fullness of
            being with an inner satisfaction and a passion for life and for
            living.
          </p>
        </div>
        {/* <Button
            asChild
            size="sm"
            className="hidden md:flex ml-auto gap-1 mb-4"
          >
            <Link href="/me5">
              Mind Dump
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button> */}
        <div className="flex gap-4">
          <DashboardClient />
          <CalendarScheduleView />
        </div>
      </div>
    </div>
  );
}
