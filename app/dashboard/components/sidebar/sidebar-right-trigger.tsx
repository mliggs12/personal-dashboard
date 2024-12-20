import { ChevronsLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export default function SidebarRightTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      // onClick={toggleSidebar}
      className="h-6 w-6"
    >
      <ChevronsLeft />
    </Button>
  );
}
