import CalendarGrid from "./calendar-grid";

export default function StoicLifeCalendar() {
  const decades = 8;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col">
        {Array.from({ length: decades }).map((_, index) => (
          <div
            className="h-[240px] w-[50px] flex items-end justify-end text-muted-foreground text-xs"
            key={index}
          >
            {index + 1}0 years
          </div>
        ))}
      </div>
      <CalendarGrid birthday="1987/01/22" />
    </div>
  );
}
