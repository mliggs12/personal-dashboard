import React from "react";

interface UpdatedTableCellProps {
  updatedAt: Date;
}

const UpdatedTableCell: React.FC<UpdatedTableCellProps> = ({ updatedAt }) => {
  const formatDateTime = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
      date.toDateString() ===
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
      ).toDateString();
    const isTwoDaysAgo =
      date.toDateString() ===
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 2,
      ).toDateString();
    const isThreeDaysAgo =
      date.toDateString() ===
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 3,
      ).toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString()}`;
    } else if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString()}`;
    } else if (isTwoDaysAgo) {
      return `2 days ago, ${date.toLocaleTimeString()}`;
    } else if (isThreeDaysAgo) {
      return `3 days ago, ${date.toLocaleTimeString()}`;
    } else {
      return date.toLocaleString();
    }
  };

  return (
    <td className="hidden md:table-cell w-[200px] whitespace-nowrap">
      {formatDateTime(updatedAt)}
    </td>
  );
};

export default UpdatedTableCell;
