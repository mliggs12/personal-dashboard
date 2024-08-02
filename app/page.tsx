import CalendarScheduleView from "@/components/calendar/calendar-schedule-view";
import AccountDataCard from "@/components/finance/account-data-card";

export default function Dashboard() {
  return (
    <main className="w-full flex flex-col flex-1 gap-4 p-2 lg:p-4">
      <div className="flex items-center mb-2">
        <h1 className="text-lg md:text-2xl font-semibold">Dashboard</h1>
      </div>
      <div className="flex gap-4">
        <AccountDataCard />
        <CalendarScheduleView />
      </div>
    </main>
  );
}
