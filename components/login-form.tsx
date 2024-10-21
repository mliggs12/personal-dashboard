import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInButton } from "@clerk/nextjs";

export function LoginForm() {
  return (
    <Card className="min-w-[425px] mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <SignInButton>
            <Button
              variant="outline"
              className="w-full"
            >
              Login with Google
            </Button>
          </SignInButton>
        </div>
      </CardContent>
    </Card>
  );
}
