import dayjs from "@/lib/dayjs.config";
import { cn } from "@/lib/utils";
import { MessageWithUserType } from "@/types";

interface MessageBoxProps {
  message: MessageWithUserType;
  currentUserId: string;
}

export default function MessageBox({ message, currentUserId }: MessageBoxProps) {
  const isOwn = message.user._id === currentUserId;

  return (
    <div className={cn("flex mt-2 md:mt-4 first:mt-0", isOwn && "justify-end")}>
      <div className={cn("flex flex-col gap-1 md:gap-2 max-w-[85%] md:max-w-[70%]", isOwn && "items-end")}>
        <div
          className={cn(
            "text-sm md:text-base w-fit overflow-hidden break-words",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground",
            false ? "rounded-md p-0" : "rounded-full py-2 md:py-2.5 px-3 md:px-4",
          )}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        <div className="flex items-center gap-1 px-1">
          <div className="text-xs text-muted-foreground">
            {dayjs(message._creationTime).format("LTS")}
          </div>
        </div>
      </div>
    </div>
  );
}
