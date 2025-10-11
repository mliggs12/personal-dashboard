import { Loader2, MessageSquare } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center space-y-4">
        <MessageSquare className="h-12 w-12 text-muted-foreground animate-pulse" />
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading AI Chat...</span>
        </div>
      </div>
    </div>
  );
}
