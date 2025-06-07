import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function SpNegSheet() {
  const [value, setValue] = useState("");
  const [statements, setStatements] = useState<string[]>([]);

  const handleAddStatement = (statement: string) => {
    setStatements((prev) => [...prev, statement]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() !== "") {
      handleAddStatement(value.trim());
      setValue("");
    }
  };

  return (
    <Sheet>
      <SheetTrigger>
        <Button size="lg" variant="secondary">Complain</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Specific Negatives - Complain to the Sheet</SheetTitle>
          <SheetDescription>
            Focus on the feeling that arises and where in the body the feeling
            is.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col">
          <ul className="space-y-2 my-6">
            {statements.map((statement, index) => (
              <li
                key={index}
                className="text-lg"
              >
                {statement}
              </li>
            ))}
            <Input
              autoComplete="off"
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a specific negative statement"
              value={value}
              className="w-full h-8 p-0 text-lg border-0 border-b-2 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
            />
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
