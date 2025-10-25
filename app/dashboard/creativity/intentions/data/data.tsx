import {
  ArchiveIcon,
  CheckCircledIcon,
  CircleIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";

export const statuses = [
  {
    value: "tithe",
    label: "Tithe",
    icon: <StopwatchIcon className="w-4 h-4 text-primary capitalize" />,
  },
  {
    value: "allow",
    label: "Allow",
    icon: <ArchiveIcon className="w-4 h-4 text-primary capitalize" />,
  },
  {
    value: "done",
    label: "Done",
    icon: <CheckCircledIcon className="w-4 h-4 text-primary capitalize" />,
  },
  {
    value: "draft",
    label: "Draft",
    icon: <CircleIcon className="w-4 h-4 text-primary capitalize" />,
  },
];

