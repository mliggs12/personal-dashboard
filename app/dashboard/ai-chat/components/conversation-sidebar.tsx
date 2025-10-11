"use client";

import { MessageSquare, Trash2, Plus, Bot, PanelLeftClose, PanelLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface Conversation {
  _id: Id<"aiConversations">;
  title?: string;
  updated: number;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: Id<"aiConversations"> | null;
  onSelectConversation: (id: Id<"aiConversations">) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: Id<"aiConversations">) => void;
  disabled?: boolean;
  isMobile?: boolean;
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  disabled = false,
  isMobile = false,
}: ConversationSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "bg-background relative h-full",
          !isMobile && "border-r transition-all duration-300 ease-in-out",
          !isMobile && (isCollapsed ? "w-16" : "w-64"),
          isMobile && "w-full"
        )}
      >
        <Card className={cn(
          "h-full rounded-none border-0",
          !isMobile && "border-r"
        )}>
          <CardHeader className={cn("pb-3", !isMobile && isCollapsed && "px-2")}>
            <div className="flex items-center justify-between gap-1">
              {(!isCollapsed || isMobile) ? (
                <>
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold text-lg">AI Chat</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={onNewConversation} 
                          size="sm" 
                          disabled={disabled}
                          aria-label="New conversation"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Start new conversation</p>
                      </TooltipContent>
                    </Tooltip>
                    {!isMobile && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsCollapsed(true)}
                            aria-label="Collapse sidebar"
                          >
                            <PanelLeftClose className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Collapse sidebar</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 w-full items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(false)}
                        aria-label="Expand sidebar"
                        className="w-full"
                      >
                        <PanelLeft className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Expand sidebar</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={onNewConversation} 
                        size="icon" 
                        disabled={disabled}
                        aria-label="New conversation"
                        className="w-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>New conversation</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
            {(!isCollapsed || isMobile) && conversations.length > 0 && (
              <Badge variant="secondary" className="w-fit">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardHeader>
          
          <Separator />
          
          <CardContent className={cn("p-0", !isMobile && isCollapsed && "px-1")}>
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className={cn(!isMobile && isCollapsed ? "p-2 space-y-2" : "p-4 space-y-2")}>
                {conversations.length === 0 ? (
                  (!isCollapsed || isMobile) ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        No conversations yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start a new conversation to begin
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-center py-4">
                      <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )
                ) : (
                  conversations.map((conv) => (
                    <div key={conv._id} className="group relative">
                      {(!isCollapsed || isMobile) ? (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={currentConversationId === conv._id ? "secondary" : "ghost"}
                                className="w-full justify-start text-left h-auto p-3 pr-12 transition-colors"
                                onClick={() => onSelectConversation(conv._id)}
                                disabled={disabled}
                              >
                                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className={cn(
                                  "truncate",
                                  !isMobile && "max-w-[140px]"
                                )}>{conv.title || "New Conversation"}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="break-words">{conv.title || "New Conversation"}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConversation(conv._id);
                            }}
                            disabled={disabled}
                            aria-label="Delete conversation"
                            title="Delete conversation"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={currentConversationId === conv._id ? "secondary" : "ghost"}
                              size="icon"
                              className="w-full h-10"
                              onClick={() => onSelectConversation(conv._id)}
                              disabled={disabled}
                              aria-label={conv.title || "Conversation"}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p className="truncate">{conv.title || "New Conversation"}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
