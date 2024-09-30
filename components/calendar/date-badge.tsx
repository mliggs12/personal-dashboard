export default function DateBadge({ date }: { date: Date }) {
  return (
    <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
      <p className="text-sm font-semibold text-gray-800">{date.getDate()}</p>
    </div>
  );
}
