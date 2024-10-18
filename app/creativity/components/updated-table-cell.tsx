import moment from "moment-timezone";
import { TableCell } from "@/components/ui/table";
import React from "react";
import clsx from "clsx";

interface UpdatedTableCellProps {
  selectedTab: string;
  updatedAt: Date | null;
}

const UpdatedTableCell: React.FC<UpdatedTableCellProps> = ({
  selectedTab,
  updatedAt,
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
      {updatedAt ? moment(updatedAt).tz("America/Denver").fromNow() : ""}
    </TableCell>
  );
};

export default UpdatedTableCell;
