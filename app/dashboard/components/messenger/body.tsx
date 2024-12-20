import { useEffect, useRef } from "react";

import { MessageWithUserType } from "@/types";

import MessageBox from "./message-box";

interface BodyProps {
  messages: MessageWithUserType[];
}

export default function Body({ messages }: BodyProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message) => (
        <MessageBox
          key={message._id}
          message={message}
        />
      ))}
      <div
        className="pt-24"
        ref={bottomRef}
      />
    </div>
  );
}
