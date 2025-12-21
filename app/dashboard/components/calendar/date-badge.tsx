export default function DateBadge({ date }: { date: Date }) {
  return (
    <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
      <p className="text-sm font-semibold text-muted-foreground">{date.getDate()}</p>
    </div>
  );
}
