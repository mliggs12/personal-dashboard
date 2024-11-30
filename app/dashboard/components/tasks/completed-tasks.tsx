import { CircleCheckBig } from "lucide-react";

export default function CompletedTodos({
  totalTasks = 0,
}: {
  totalTasks: number;
}) {
  return (
    <div className="flex items-center gap-1 border-b-2 py-6 px-2 text-sm text-foreground/80">
      <>
        <CircleCheckBig />
        <span>+ {totalTasks}</span>
        <span className="capitalize">completed tasks</span>
      </>
    </div>
  );
}
