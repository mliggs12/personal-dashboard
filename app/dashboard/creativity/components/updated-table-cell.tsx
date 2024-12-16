import { TableCell } from "@/components/ui/table";
import clsx from "clsx";
import React from "react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

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
      {dayjs(updated).format("LLL")}
    </TableCell>
  );
};

export default UpdatedTableCell;
