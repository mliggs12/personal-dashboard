import {
  ArchiveIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";
import {
  Calendar,
  CalendarCheck,
  CalendarDays,
  X,
} from "lucide-react";

export const labels = [
  {
    value: "bug",
    label: "Bug",
    icon: QuestionMarkCircledIcon, // Added icon for consistency
  },
  {
    value: "feature",
    label: "Feature",
    icon: CircleIcon, // Added icon for consistency
  },
  {
    value: "documentation",
    label: "Documentation",
    icon: StopwatchIcon, // Added icon for consistency
  },
];

export const statuses = [
  {
    value: "backlog",
    label: "Backlog",
    icon: (
      <QuestionMarkCircledIcon className="w-4 h-4 text-primary capitalize" />
    ),
  },
  {
    value: "todo",
    label: "Todo",
    icon: <CircleIcon className="w-4 h-4 text-primary capitalize" />,
  },
  {
    value: "in_progress", // Updated to match schema
    label: "In Progress",
    icon: <StopwatchIcon className="w-4 h-4 text-primary capitalize" />,
  },
  {
    value: "done",
    label: "Done",
    icon: <CheckCircledIcon className="w-4 h-4 text-primary capitalize" />,
  },
  {
    value: "archived", // Added archived status
    label: "Archived",
    icon: <ArchiveIcon className="w-4 h-4 text-primary capitalize" />,
  },
];

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: <ArrowDownIcon className="w-4 h-4 text-primary capitalize" />,
  },
  {
    label: "Normal",
    value: "normal",
    icon: <ArrowRightIcon className="w-4 h-4 text-primary capitalize" />,
  },
  {
    label: "High",
    value: "high",
    icon: <ArrowUpIcon className="w-4 h-4 text-primary capitalize" />,
  },
];

export const frequencies = [
  {
    label: "None",
    value: "none",
    icon: <X className="w-4 h-4 text-muted-foreground" />,
  },
  {
    label: "Daily",
    value: "daily",
    icon: <CalendarCheck className="w-4 h-4 text-primary capitalize" />,
  },
  {
    label: "Weekly",
    value: "weekly",
    icon: <CalendarDays className="w-4 h-4 text-primary capitalize" />,
  },
  {
    label: "Monthly",
    value: "monthly",
    icon: <Calendar className="w-4 h-4 text-primary capitalize" />,
  },
];

export const tagColors = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
];
