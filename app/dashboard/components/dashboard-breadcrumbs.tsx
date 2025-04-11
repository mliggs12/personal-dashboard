import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";

import { navItems } from "@/app/dashboard/components/sidebar/data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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

  // Handle special case for creativity section
  if (segments.length >= 3 && segments[1] === "creativity") {
    // For focus blocks
    if (segments[2] === "focus-blocks") {
      if (segments.length === 3) {
        // Main focus blocks page
        return {
          current: "Focus Blocks",
          showParent: true,
          showSection: true,
          section: "Creativity",
          sectionUrl: "/dashboard/creativity",
        };
      } else if (segments.length === 4) {
        // Individual focus block page
        return {
          current: "Focus Block",
          showParent: true,
          showSection: true,
          section: "Focus Blocks",
          sectionUrl: "/dashboard/creativity/focus-blocks",
        };
      }
    }

    // For intentions
    if (segments[2] === "intentions") {
      if (segments.length === 3) {
        // Main intentions page
        return {
          current: "Intentions",
          showParent: true,
          showSection: true,
          section: "Creativity",
          sectionUrl: "/dashboard/creativity",
        };
      } else if (segments.length === 4) {
        // Individual intention page
        return {
          current: "Intention",
          showParent: true,
          showSection: true,
          section: "Intentions",
          sectionUrl: "/dashboard/creativity/intentions",
        };
      }
    }
  }

  // Default handling for other paths
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

  // Extract IDs from the path for different content types
  const segments = pathname.split("/").filter(Boolean);
  const isNotePage = section === "Notes" && segments.length > 3;
  const isFocusBlockPage = section === "Focus Blocks" && segments.length > 3;
  const isIntentionPage = section === "Intentions" && segments.length > 3;

  // Get the ID from the last segment
  const contentId = segments[segments.length - 1] as Id<any>;

  // Query different content types based on the page type
  const note = useQuery(api.notes.get, isNotePage ? { noteId: contentId as Id<"notes"> } : "skip");
  const focusBlock = useQuery(api.focusBlocks.get, isFocusBlockPage ? { id: contentId as Id<"focusBlocks"> } : "skip");
  const intention = useQuery(api.intentions.get, isIntentionPage ? { intentionId: contentId as Id<"intentions"> } : "skip");

  // Determine the display title based on the content type
  let displayTitle = current;
  if (note) {
    displayTitle = note.title;
  } else if (focusBlock) {
    displayTitle = focusBlock.startStatement || "Focus Block";
  } else if (intention) {
    displayTitle = intention.title || "Intention";
  }

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
