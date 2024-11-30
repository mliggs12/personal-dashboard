import {
  Brain,
  ListTodo,
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
    title: "Memento Mori",
    url: "/dashboard/wellness",
    icon: Skull,
  },
];
