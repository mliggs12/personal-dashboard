import { CardTitle } from "@/components/ui/card";
import { Doc } from "@/convex/_generated/dataModel";

export default function IntentionTitle({
  intention,
}: {
  intention: Doc<"intentions">;
}) {
  return (
    <CardTitle className="text-4xl hover:text-primary cursor-pointer">
      {intention.title}
    </CardTitle>
  );
}
