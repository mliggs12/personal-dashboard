import { Doc } from "@/convex/_generated/dataModel";
import clsx from "clsx";

export default function Task({
  data,
  isPreselected,
  handleOnChange,
}: {
  data: Doc<"tasks">;
  isPreselected: boolean;
  handleOnChange: (selected: boolean) => void;
}) {
  const { name: taskName, _id } = data;

  const handleClick = () => {
    handleOnChange(!isPreselected);
  };

  return (
    <div
      key={_id}
      className={clsx(
        "flex text-2xl border-b-2 p-2 animate-in fade-in cursor-pointer",
        isPreselected && "bg-blue-100 text-black font-bold",
      )}
      onClick={handleClick}
    >
      <p>{taskName}</p>
    </div>
  );
}
