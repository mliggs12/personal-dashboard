import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function SpNegSheet() {
  const [value, setValue] = useState("");
  return (
    <Sheet>
      <SheetTrigger>
        <Button>Complain</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Specific Negatives - Complain to the Sheet</SheetTitle>
          <SheetDescription>
            Focus on the feeling that arises and where in the body the feeling
            is.
          </SheetDescription>
          <Textarea
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
