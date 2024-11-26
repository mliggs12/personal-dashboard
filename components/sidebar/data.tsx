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
    url: "/tasks",
    icon: ListTodo,
  },
  {
    title: "Notes",
    url: "/notes",
    icon: StickyNote,
  },
  {
    title: "Interstitial/Pomodoro",
    url: "/interstitial",
    icon: Timer,
  },
  {
    title: "Mind Dump",
    url: "/me5",
    icon: Brain,
  },
  // {
  //   title: "Plan",
  //   url: "/plan",
  //   icon: TableProperties,
  // },
  {
    title: "Intentions",
    url: "/creativity",
    icon: Shapes,
  },
  {
    title: "Beliefs",
    url: "/beliefs",
    icon: Sunrise,
  },
  {
    title: "Memento Mori",
    url: "/wellness",
    icon: Skull,
  },
];
