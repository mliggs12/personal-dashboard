import Link from "next/link"
import { Files, TableProperties } from "lucide-react"


export default function MobileNavbar() {
  return (
    <nav className="sticky bottom-0 z-99 w-full bg-muted border-t">
      <div className="pb-6 flex justify-between p-3 dark:shadow-[0_6px_20px_rgba(0,0,0,0.45)]">

        <div className="nav-items flex w-full gap-4 text-muted-foreground">
          <Link href="/dashboard/plan" className="flex flex-col h-16 w-16 gap-2 items-center justify-center rounded-xl transition-all hover:bg-secondary active:translate-y-[1px]">
            <TableProperties size={24} />
            <span className="text-sm">Today</span>
          </Link>
          <Link href="/dashboard/plan/templates" className="flex flex-col h-16 w-16 gap-2 items-center justify-center rounded-xl transition-all hover:bg-secondary active:translate-y-[1px]">
            <Files size={24} />
            <span className="text-sm">Templates</span>
          </Link>
        </div>

      </div>
    </nav>
  )
}
