import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function CloseModalButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => router.back()}
    >
      Cancel
    </Button>
  );
}

