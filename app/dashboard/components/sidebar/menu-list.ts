import {
  SquarePen,
  LayoutGrid,
  LucideIcon,
  Shapes,
  TableProperties,
  SquareCheckBig,
  Bomb,
  Sunrise,
  Timer,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname.includes("/dashboard"),
          icon: LayoutGrid,
          submenus: [],
        },
        {
          href: "/creativity",
          label: "Creativity",
          active: pathname.includes("/creativity"),
          icon: Shapes,
          submenus: [],
        },
        {
          href: "/plan",
          label: "Plan",
          active: pathname.includes("/plan"),
          icon: TableProperties,
          submenus: [],
        },
        {
          href: "/tasks",
          label: "Tasks",
          active: pathname.includes("/tasks"),
          icon: SquareCheckBig,
          submenus: [],
        },
        {
          href: "/release",
          label: "Release",
          active: pathname.includes("/release"),
          icon: Sunrise,
          submenus: [],
        },
        {
          href: "/interstitial",
          label: "Interstitial",
          active: pathname.includes("/interstitial"),
          icon: Timer,
          submenus: [],
        },
        {
          href: "/dashboard/notes",
          label: "Notes",
          active: pathname.includes("/notes"),
          icon: SquarePen,
          submenus: [],
        },
      ],
    },
  ];
}
