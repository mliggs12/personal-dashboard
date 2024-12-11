import StoicLifeCalendar from "./components/stoic-life-calendar";

export default function StoicismPage() {
  return (
    <div className="flex flex-col p-2 gap-2">
      <h1 className="text-2xl font-semibold">Stoic Life Calendar</h1>
      <StoicLifeCalendar />
    </div>
  );
}
