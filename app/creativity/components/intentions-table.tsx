"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import UpdatedTableCell from "./updated-table-cell";
import moment from "moment";

interface IntentionsTableProps {
  intentions: Doc<"intentions">[];
  selectedTab: string;
}

const statuses = [
  { value: "tithe", label: "To Tithe" },
  { value: "allow", label: "Allowing" },
  { value: "done", label: "Done" },
  { value: "draft", label: "Draft" },
];

const getStatusLabel = (statusValue: string) => {
  return (
    statuses.find((status) => status.value === statusValue)?.label ||
    statusValue
  );
};

export default function IntentionsTable({
  intentions,
  selectedTab,
}: IntentionsTableProps) {
  const router = useRouter();
  const emotions = useQuery(api.emotions.list);

  const getEmotionColor = (emotionId: string) => {
    const emotion = emotions?.find((e) => e._id === emotionId);
    if (!emotion) return "#6c757d"; // Subtle gray color if emotion not found

    if (!emotion.color) {
      // Assign a subtle color if none exists
      switch (emotion.label.toLowerCase()) {
        case "freedom":
          return "#4a90e2"; // Subtle blue
        case "fullness":
          return "#8e44ad"; // Subtle purple
        case "passion":
          return "#c0392b"; // Subtle red
        case "joy":
          return "#f39c12"; // Subtle yellow
        case "enjoyment":
          return "#27ae60"; // Subtle green
        case "enthusiasm":
          return "#d35400"; // Subtle orange
        default:
          return "#6c757d"; // Subtle gray
      }
    }

    return emotion.color;
  };

  const tableHeads = [
    // TODO: Add image
    // {
    //   name: "",
    //   className: "hidden w-[100px] sm:table-cell",
    // },
    {
      name: "Intention",
      className: "w-full",
    },
    {
      name: "Status",
      className: `hidden ${selectedTab === "all" ? "md:table-cell" : ""} w-[150px]`,
    },
    {
      name: "Emotion",
      className: "hidden md:table-cell w-[150px]",
    },
    {
      name: "Updated at",
      className: `hidden ${selectedTab !== "draft" ? "md:table-cell" : ""} w-[200px] whitespace-nowrap`,
    },
    {
      name: "Created at",
      className: `hidden ${selectedTab === "draft" || selectedTab === "all" ? "md:table-cell" : ""} w-[200px] whitespace-nowrap`,
    },
    {
      name: "",
      className: "w-[150px]", // Fixed width for the last cell
    },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {tableHeads.map((head) => (
            <TableHead
              key={head.name}
              className={head.className}
            >
              {head.name}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {intentions?.map((intention) => (
          <TableRow key={intention._id}>
            <TableCell className="hidden">
              {" "}
              {/* TODO: Add image */}
              <Image
                alt={`Intention ${intention.title} image`}
                className="aspect-square rounded-md object-cover"
                height={64}
                width={64}
                src=""
              />
            </TableCell>
            {/* Intention title */}
            <TableCell className="w-full">{intention.title}</TableCell>
            {/* Status */}
            <TableCell
              className={`hidden ${selectedTab === "all" ? "md:table-cell" : ""} w-[150px] whitespace-nowrap`}
            >
              <Badge variant="outline">
                {getStatusLabel(intention.status ?? "")}
              </Badge>
            </TableCell>
            {/* Emotion */}
            <TableCell className="hidden md:table-cell w-[150px]">
              <Badge
                variant="outline"
                style={{
                  backgroundColor: getEmotionColor(intention.emotionId ?? ""),
                  color: "white", // Text color for better contrast
                }}
              >
                {
                  emotions?.find(
                    (emotion) => emotion._id === intention.emotionId,
                  )?.label
                }
              </Badge>
            </TableCell>
            {/* Updated at */}
            <TableCell
              className={`hidden ${selectedTab !== "draft" ? "md:table-cell" : ""} w-[200px] whitespace-nowrap`}
            >
              {intention.updatedAt ? (
                <UpdatedTableCell updatedAt={new Date(intention.updatedAt)} />
              ) : (
                ""
              )}
            </TableCell>
            {/* Created at */}
            <TableCell
              className={`hidden ${selectedTab === "draft" || selectedTab === "all" ? "md:table-cell" : ""} w-[200px] whitespace-nowrap`}
            >
              {intention._creationTime
                ? moment(intention._creationTime).format(
                    "MM/DD/YYYY, hh:mm:ss A",
                  )
                : ""}
            </TableCell>
            {/* Actions */}
            <TableCell className="w-[150px]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-haspopup="true"
                    size="icon"
                    variant="ghost"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={() =>
                      router.push(`/creativity/intentions/${intention._id}`)
                    }
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
