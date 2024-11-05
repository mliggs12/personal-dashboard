import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  return (
    <Card className="min-w-[425px] mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            Login with Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
