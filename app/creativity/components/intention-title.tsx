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
