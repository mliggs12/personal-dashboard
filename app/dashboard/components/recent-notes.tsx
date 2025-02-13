import { useQuery } from "convex/react";
import { FileText } from "lucide-react";
import Link from "next/link";

import { SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";

export function RecentNotes() {
  const notes = useQuery(api.notes.recent);

  if (notes === undefined) {
    return <div>Loading...</div>
  }

  return (
    <SidebarMenuSub>
      <div className="text-[10px] uppercase ml-2">Recent Notes</div>
      {notes.map((note) => (
        <SidebarMenuSubItem key={note._id}>
          <SidebarMenuSubButton asChild>
            <Link href={`/dashboard/notes/${note._id}`}>
              <FileText />
              <span>{note.title}</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  )
}