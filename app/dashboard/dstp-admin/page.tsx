"use client";

import { useQuery } from "convex/react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import MessengerBody from "./components/messenger/messenger-body";
import { MessengerForm } from "./components/messenger/messenger-form";
import LinkSection from "./components/link-section";
import { dstpAdminLinks } from "./data";

function getAdminUserIds(): string[] {
  const user1 = process.env.NEXT_PUBLIC_USER_1;
  const user2 = process.env.NEXT_PUBLIC_USER_2;
  
  if (!user1 || !user2) {
    console.warn("Admin user IDs not configured");
    return [];
  }
  
  return [user1, user2];
}

function getStaticChatId(): Id<"chats"> | null {
  const chatId = process.env.NEXT_PUBLIC_DSTP_CHAT_ID;
  if (!chatId) {
    console.error("DSTP_CHAT_ID not configured");
    return null;
  }
  return chatId as Id<"chats">;
}

function isAuthorizedUser(userId: string | undefined): boolean {
  if (!userId) return false;
  const adminIds = getAdminUserIds();
  return adminIds.includes(userId);
}

export default function DSTPAdminPage() {
  const staticChatId = getStaticChatId();
  const currentUser = useQuery(api.users.current);
  const chatWithMessages = useQuery(
    api.chats.getChat,
    staticChatId ? { chatId: staticChatId } : "skip"
  );
  
  // Get user IDs from the chat data (more reliable than env vars)
  const chatUserIds = chatWithMessages?.chat 
    ? [chatWithMessages.chat.chatterOneId, chatWithMessages.chat.chatterTwoId]
    : [];
  
  // Fetch both admin users from chat data
  const user1 = useQuery(
    api.users.get,
    chatUserIds[0] ? { userId: chatUserIds[0] } : "skip"
  );
  const user2 = useQuery(
    api.users.get,
    chatUserIds[1] ? { userId: chatUserIds[1] } : "skip"
  );

  // Handle missing configuration
  if (!staticChatId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Configuration Error</h1>
          <p className="text-muted-foreground">
            Chat configuration is missing. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (currentUser === undefined || chatWithMessages === undefined || user1 === undefined || user2 === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Authorization check
  if (!currentUser || !isAuthorizedUser(currentUser._id)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Unauthorized</h1>
          <p className="text-muted-foreground">
            You do not have access to this page.
          </p>
        </div>
      </div>
    );
  }

  const hasLinks = dstpAdminLinks.some((section) => section.links.length > 0);

  return (
    <div className="h-full flex flex-col flex-1 overflow-y-auto overflow-x-hidden w-full">
      <div className="flex flex-col items-start px-4 md:px-8 py-4 md:py-6 w-full gap-4 md:gap-6">
        {/* Header */}
        <div className="w-full">
          <h1 className="text-2xl md:text-3xl font-semibold mb-1 md:mb-2">DSTP Admin Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage and access DSTP company resources and tools
          </p>
        </div>

        {/* Links Section */}
        {hasLinks && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
            {dstpAdminLinks.map((section, index) => (
              <LinkSection key={index} section={section} />
            ))}
          </div>
        )}

        {!hasLinks && (
          <div className="w-full text-center py-8 md:py-12 text-muted-foreground">
            <p className="text-sm md:text-base">No links configured yet. Add links to the data file to get started.</p>
          </div>
        )}

        {/* Admin Chat Section */}
        <div className="w-full mt-4 md:mt-8 flex flex-col gap-3 md:gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-1 md:mb-2">Admin Chat</h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Ongoing communication and message board for DSTP admins
            </p>
          </div>
          <div className="flex flex-col border rounded-lg bg-card h-[calc(100vh-400px)] md:h-[600px] min-h-[400px] max-h-[calc(100vh-200px)] md:max-h-none">
            <div className="messenger-header p-3 md:p-4 border-b shrink-0 flex items-center space-x-2">
              <h3 className="font-semibold text-base md:text-lg">Admin Chat</h3>
              <div className="flex items-center space-x-1">
                {user2 && (
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      {user2.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "U2"}
                    </AvatarFallback>
                  </Avatar>
                )}
                {user1 && (
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user1.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "U1"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
            <MessengerBody 
              messages={chatWithMessages?.messagesWithUsers || []} 
              currentUserId={currentUser._id}
            />
            <MessengerForm
              authorId={currentUser._id}
              chatId={staticChatId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

