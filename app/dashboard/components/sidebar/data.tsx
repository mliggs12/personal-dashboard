import {
  Bed,
  Book,
  Brain,
  Folder,
  HeartPulse,
  ListTodo,
  MessagesSquare,
  Shapes,
  Skull,
  StickyNote,
  Sunrise,
  Timer,
} from "lucide-react";

export const navItems = [
  {
    title: "Tasks",
    url: "/dashboard/tasks",
    icon: ListTodo,
  },
  {
    title: "Projects",
    url: "/dashboard/projects",
    icon: Folder,
  },
  {
    title: "Notes",
    url: "/dashboard/notes",
    icon: StickyNote,
  },
  {
    title: "Interstitial/Pomodoro",
    url: "/dashboard/interstitial",
    icon: Timer,
  },
  {
    title: "Mind Dump",
    url: "/dashboard/me5",
    icon: Brain,
  },
  // {
  //   title: "Plan",
  //   url: "/plan",
  //   icon: TableProperties,
  // },
  {
    title: "Intentions",
    url: "/dashboard/creativity/intentions",
    icon: Shapes,
  },
  {
    title: "Beliefs",
    url: "/dashboard/beliefs",
    icon: Sunrise,
  },
  {
    title: "Wellness",
    url: "/dashboard/wellness",
    icon: HeartPulse,
  },
  {
    title: "Sleep Tracker",
    url: "/dashboard/sleep",
    icon: Bed,
  },
  {
    title: "Memento Mori",
    url: "/dashboard/stoicism",
    icon: Skull,
  },
  {
    title: "Chat",
    url: "/dashboard/chat",
    icon: MessagesSquare,
  },
  {
    title: "Journal",
    url: "/dashboard/journal",
    icon: Book,
  },
];
