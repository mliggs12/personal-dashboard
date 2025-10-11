import {
  Bed,
  Book,
  Bot,
  Brain,
  Dumbbell,
  Folder,
  HeartPulse,
  ListTodo,
  MessagesSquare,
  Shapes,
  Skull,
  StickyNote,
  Sunrise,
  Target,
  Timer,
  Zap,
} from "lucide-react";

export const navItems = [
  {
    title: "Tasks",
    url: "/dashboard/tasks",
    icon: ListTodo,
  },
  // {
  //   title: "Projects",
  //   url: "/dashboard/projects",
  //   icon: Folder,
  // },
  {
    title: "Notes",
    url: "/dashboard/notes",
    icon: StickyNote,
  },
  {
    title: "AI Chat",
    url: "/dashboard/ai-chat",
    icon: Bot,
  },
  // {
  //   title: "Interstitial/Pomodoro",
  //   url: "/dashboard/interstitial",
  //   icon: Timer,
  // },
  // {
  //   title: "Plan",
  //   url: "/plan",
  //   icon: TableProperties,
  // },
  {
    title: "Intentions",
    url: "/dashboard/creativity/intentions",
    icon: Target,
  },
  {
    title: "Focus Blocks",
    url: "/dashboard/creativity/focus-blocks",
    icon: Zap,
  },
  // {
  //   title: "Beliefs",
  //   url: "/dashboard/beliefs",
  //   icon: Sunrise,
  // },
  {
    title: "Wellness",
    url: "/dashboard/wellness",
    icon: HeartPulse,
  },
  // {
  //   title: "Lift",
  //   url: "/dashboard/lift",
  //   icon: Dumbbell,
  // },
  // {
  //   title: "Sleep Tracker",
  //   url: "/dashboard/sleep",
  //   icon: Bed,
  // },
  // {
  //   title: "Memento Mori",
  //   url: "/dashboard/stoicism",
  //   icon: Skull,
  // },
  // {
  //   title: "Chat",
  //   url: "/dashboard/chat",
  //   icon: MessagesSquare,
  // },
  {
    title: "Journal",
    url: "/dashboard/journal",
    icon: Book,
  },
  {
    title: "Mind Dump",
    url: "/dashboard/me5",
    icon: Brain,
  },
];
