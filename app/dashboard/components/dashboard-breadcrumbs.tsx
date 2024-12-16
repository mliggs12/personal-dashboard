import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { navItems } from "@/app/dashboard/components/sidebar/data";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type BreadcrumbDetails = {
  current: string;
  showParent: boolean;
  showSection: boolean;
  section: string | null;
  sectionUrl: string | undefined;
};

const getBreadcrumbDetails = (path: string): BreadcrumbDetails => {
  const segments = path.split("/").filter(Boolean);

  switch (segments.length) {
    case 2: {
      const currentItem = navItems.find((item) => path.startsWith(item.url));
      return {
        current: currentItem?.title || segments[1],
        showParent: true,
        showSection: false,
        section: null,
        sectionUrl: undefined,
      };
    }

    case 3: {
      const section = navItems.find((item) => item.url.includes(segments[1]));
      return {
        current: segments[2],
        showParent: true,
        showSection: true,
        section: section?.title || segments[1],
        sectionUrl: `/dashboard/${segments[1]}`,
      };
    }

    default:
      return {
        current: "Dashboard",
        showParent: false,
        showSection: false,
        section: null,
        sectionUrl: undefined,
      };
  }
};

const truncateText = (text: string, maxLength: number = 24): string =>
  text.length > maxLength ? `${text.slice(0, 20)}...` : text;

export default function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const { current, showParent, showSection, section, sectionUrl } =
    getBreadcrumbDetails(pathname);

  const noteId =
    section && section === "Notes" ? (current as Id<"notes">) : null;

  const note = useQuery(api.notes.get, noteId ? { noteId } : "skip");

  const displayTitle = note?.title || current;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {showParent && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        {showSection && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href={sectionUrl}>{section}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage className="text-foreground">
            {truncateText(displayTitle)}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
