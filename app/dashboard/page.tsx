import { Id } from "@/convex/_generated/dataModel";

import ChatBox from "./components/messenger/chat-box";
import TasksCard from "./components/tasks/tasks-card";

export default function DashboardPage() {
  const staticChatId = "pn7555asfrcprprgr6cc1rdg9x76aqdr" as Id<"chats">;

  return (
    <div className="h-full flex flex-col flex-1">
      <TasksCard />
      {/* <CalendarScheduleView /> */}
      {/* <ChatBox chatId={staticChatId} /> */}
    </div>
  );
}
