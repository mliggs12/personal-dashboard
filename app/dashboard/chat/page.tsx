"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import MessengerBody from "../components/messenger/messenger-body";
import { MessengerForm } from "../components/messenger/messenger-form";

export default function ChatPage() {
  const staticChatId = process.env.NEXT_PUBLIC_DSTP_CHAT_ID as Id<"chats">;

  const chatWithMessages = useQuery(api.chats.getChat, {
    chatId: staticChatId,
  });
  const currentUser = useQuery(api.users.current);

  if (chatWithMessages === undefined || currentUser === undefined)
    return <div>Loading...</div>;

  if (
    currentUser === null ||
    ![process.env.NEXT_PUBLIC_USER_1, process.env.NEXT_PUBLIC_USER_2].includes(
      currentUser._id,
    )
  )
    return <div>Unauthorized</div>;

  return (
    <div className="flex flex-col h-full px-1">
      <div className="messenger-header p-2">
        <h1 className="font-semibold text-lg">DSTP Chat</h1>
      </div>
      <MessengerBody messages={chatWithMessages?.messagesWithUsers} />
      <MessengerForm
        authorId={currentUser._id}
        chatId={staticChatId}
      />
    </div>
  );
}
