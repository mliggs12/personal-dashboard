// External libraries
import { preloadQuery } from "convex/nextjs";
import { Preloaded, usePreloadedQuery } from "convex/react";
import {
  Bell,
  CircleUser,
  Home,
  Menu,
  Package,
  Package2,
  Search,
} from "lucide-react";
import Link from "next/link";

// Internal modules
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Relative imports
import CreateIntentionDialog from "./create-intention-dialog";
import IntentionsTable from "./intentions-table";
import { api } from "@/convex/_generated/api";

export default async function IntentionsPage() {
  const preloadedIntentions = await preloadQuery(api.intentions.list);

  if (preloadedIntentions === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <Package className="h-4 w-4" />
                Intentions{" "}
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <CreateIntentionDialog />
        <Card>
          <CardHeader>
            <CardTitle>Intentions</CardTitle>
            <CardDescription>
              Manage your intentions and view their manifestation progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IntentionsTable preloadedIntentions={preloadedIntentions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
