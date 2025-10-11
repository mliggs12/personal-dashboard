"use client";

import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="text-center max-w-md w-full space-y-4">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        
        <div>
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            An unexpected error occurred in the AI chat.
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription className="mt-2">
            {error.message || 'An unexpected error occurred'}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2 justify-center">
          <Button onClick={reset} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          If this problem persists, please check that Ollama is running.
        </p>
      </div>
    </div>
  );
}
