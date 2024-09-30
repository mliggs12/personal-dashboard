import { useRef, useState } from "react";
import { Input } from "./ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "@/hooks/use-toast";

export default function CreateNoteInput() {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createNote = useMutation(api.notes.create);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await createNote({ title });
      toast({
        title: "Note created",
      });
      inputRef.current?.blur();
      setTitle("");
    }
  };

  return (
    <form className="flex-1 sm:flex-initial">
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Create a new note..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="sm:w-[300px] md:w-[200px] lg:w-[300px]"
        />
      </div>
    </form>
  );
}
