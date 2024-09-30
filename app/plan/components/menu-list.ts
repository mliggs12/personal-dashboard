import { SquarePen, LayoutGrid, LucideIcon } from "lucide-react";

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
          href: "/plan",
          label: "Dashboard",
          active: pathname.includes("/plan"),
          icon: LayoutGrid,
          submenus: [],
        },
        {
          href: "/plan/schedules",
          label: "Schedules",
          active: pathname.includes("/schedules"),
          icon: SquarePen,
          submenus: [],
        },
      ],
    },
  ];
}
