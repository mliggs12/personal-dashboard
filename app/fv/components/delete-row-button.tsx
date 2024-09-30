import { TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeleteRowButton({
  selectedRows,
}: {
  selectedRows: any;
}) {
  const handleBatchDelete = () => {
    const tasksToDelete = selectedRows.map(
      (row: { original: any }) => row.original,
    );
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBatchDelete}
    >
      <TrashIcon className="w-4 h-4 text-destructive" />
    </Button>
  );
}
