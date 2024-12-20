"use client";

import { useQuery } from "convex/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { MessageWithUserType } from "@/types";

dayjs.extend(localizedFormat);

interface MessageBoxProps {
  message: MessageWithUserType;
}

export default function MessageBox({ message }: MessageBoxProps) {
  const currentUser = useQuery(api.users.current);
  if (currentUser === undefined) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>Unauthorized</div>;
  }

  const isOwn = message.user._id === currentUser._id;

  return (
    <div className={cn("flex gap-3 p-4", isOwn && "justify-end")}>
      <div className={cn(isOwn && "order-2")}>
        <Avatar>
          <AvatarImage
            src={""}
            alt={message.user.name}
          />
          <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div className={cn("flex flex-col gap-2", isOwn && "items-end")}>
        <div
          className={cn(
            "text-sm w-fit overflow-hidden",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground",
            false ? "rounded-md p-0" : "rounded-full py-2 px-3",
          )}
        >
          <div>{message.content}</div>
        </div>
        <div className="flex items-center gap-1">
          <div className="text-xs text-gray-400">
            {dayjs(message._creationTime).format("LTS")}
          </div>
        </div>
      </div>
    </div>
  );
}
