import { TableCell } from "@/app/components/ui/table";
import clsx from "clsx";
import moment from "moment-timezone";
import React from "react";

interface UpdatedTableCellProps {
  selectedTab: string;
  updated: Date | null;
}

const UpdatedTableCell: React.FC<UpdatedTableCellProps> = ({
  selectedTab,
  updated,
}) => {
  return (
    <TableCell
      className={clsx("hidden", {
        "table-cell w-[200px] whitespace-nowrap text-lg":
          selectedTab === "tithe",
        "sm:table-cell w-[200px] whitespace-nowrap text-lg":
          selectedTab !== "draft",
      })}
    >
      {updated ? moment(updated).tz("America/Denver").format("MMM D LT") : ""}
    </TableCell>
  );
};

export default UpdatedTableCell;
