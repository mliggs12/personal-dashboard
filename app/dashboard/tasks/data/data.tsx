import {
  ArchiveIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";

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
    value: "cancelled",
    label: "Cancelled",
    icon: <CrossCircledIcon className="w-4 h-4 text-primary capitalize" />,
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
    icon: <ArrowDownIcon className="w-4 h-4 text-primary capitalize" />,
  },
  {
    label: "3-Day",
    value: "3-day",
    icon: <ArrowRightIcon className="w-4 h-4 text-primary capitalize" />,
  },
  {
    label: "Weekly",
    value: "weekly",
    icon: <ArrowUpIcon className="w-4 h-4 text-primary capitalize" />,
  },
];
