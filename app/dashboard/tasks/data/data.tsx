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
  CalendarClock,
  CalendarDays,
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
    label: "Daily",
    value: "daily",
    icon: <CalendarCheck className="w-4 h-4 text-primary capitalize" />,
  },
  {
    label: "3-Day",
    value: "3-day",
    icon: <CalendarClock className="w-4 h-4 text-primary capitalize" />,
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
