"use client";

import { useQuery } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import Body from "./body";
import { Form } from "./form";

// Dev
const mUserID = "p178pq3a4082qc31p75qjyymy57637v2" as Id<"users">;
const jUserID = "p17azzp5g5n24cgvbzaayj50d976bc8d" as Id<"users">;

interface ChatBoxProps {
  chatId: Id<"chats">;
}

export default function ChatBox({ chatId }: ChatBoxProps) {
  const chatWithMessages = useQuery(api.chats.getChat, { chatId });
  const currentUser = useQuery(api.users.current);

  const isMobile = useIsMobile();

  if (chatWithMessages === undefined || currentUser === undefined)
    return <div>Loading...</div>;

  if (currentUser === null) return <div>Unauthorized</div>;

  return (
    <Card
      className={cn(
        "flex flex-col h-1/2 w-full md:w-1/2",
        isMobile && "border-none",
        (currentUser._id === mUserID || currentUser._id === jUserID) && "block",
      )}
    >
      <CardHeader>
        <CardTitle>DSTP Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col p-0">
        <Body messages={chatWithMessages.messagesWithUsers} />
        <Form
          authorId={currentUser._id}
          chatId={chatWithMessages.chat._id}
        />
      </CardContent>
    </Card>
  );
}
