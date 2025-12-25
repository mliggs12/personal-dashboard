import { useEffect, useRef } from "react";

import { MessageWithUserType } from "@/types";

import MessageBox from "./message-box";

interface BodyProps {
  messages: MessageWithUserType[];
  currentUserId: string;
}

export default function Body({ messages, currentUserId }: BodyProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 relative min-h-0">
      <div className="absolute inset-0 overflow-y-auto p-2 md:p-4">
        {messages?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm md:text-base">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages?.map((message) => (
              <MessageBox
                key={message._id}
                message={message}
                currentUserId={currentUserId}
              />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </div>
  );
}
