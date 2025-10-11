"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { Send, Plus, MessageSquare, Loader2, ChevronDown, Menu } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAutoScroll } from "./hooks/use-auto-scroll";
import { useStreamingMessage } from "./hooks/use-streaming-message";
import { ChatMessage } from "./components/chat-message";
import { ConversationSidebar } from "./components/conversation-sidebar";
import { generateConversationTitle } from "./lib/generate-title";
import { SimplePromptForm } from "./components/simple-prompt-form";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatPage() {
  const [currentConversationId, setCurrentConversationId] = useState<Id<"aiConversations"> | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { scrollRef, isUserScrolling, setIsUserScrolling } = useAutoScroll(messages);
  const { sendMessage, isStreaming } = useStreamingMessage();

  const conversations = useQuery(api.aiConversations.list);
  const currentConversation = useQuery(
    api.aiConversations.get,
    currentConversationId ? { conversationId: currentConversationId } : "skip"
  );

  const createConversation = useMutation(api.aiConversations.create);
  const updateTitle = useMutation(api.aiConversations.updateTitle);
  const deleteConversation = useMutation(api.aiConversations.deleteConversation);

  // Load conversation messages
  useEffect(() => {
    if (currentConversation?.messages) {
      setMessages(currentConversation.messages.map(msg => ({
        id: msg._id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })));
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  // Auto-generate conversation title using AI after first exchange
  useEffect(() => {
    const generateTitle = async () => {
      if (
        currentConversationId &&
        currentConversation?.conversation &&
        !currentConversation.conversation.title &&
        messages.length >= 2 && // Wait for at least one exchange (user + assistant)
        !isStreaming // Don't generate while streaming
      ) {
        try {
          const title = await generateConversationTitle(
            messages.map(m => ({ role: m.role, content: m.content }))
          );
          await updateTitle({ conversationId: currentConversationId, title });
        } catch (error) {
          console.error('Failed to generate title:', error);
        }
      }
    };

    generateTitle();
  }, [currentConversationId, currentConversation, messages, updateTitle, isStreaming]);

  // Event handlers
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');

    try {
      // Create conversation if needed
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await createConversation({});
        setCurrentConversationId(conversationId);
      }

      // Send message with streaming
      await sendMessage(userMessage, conversationId, messages, setMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleNewConversation = useCallback(async () => {
    if (isStreaming) return;
    
    try {
      const conversationId = await createConversation({});
      setCurrentConversationId(conversationId);
      setMessages([]);
      toast.success('New conversation started');
    } catch (error) {
      toast.error('Failed to create conversation');
    }
  }, [isStreaming, createConversation]);

  const handleSelectConversation = useCallback((id: Id<"aiConversations">) => {
    setCurrentConversationId(id);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const handleDeleteConversation = useCallback(async (id: Id<"aiConversations">) => {
    if (isStreaming) return;
    
    try {
      await deleteConversation({ conversationId: id });
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  }, [isStreaming, deleteConversation, currentConversationId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + C for new conversation (C = Chat)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        handleNewConversation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewConversation]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setIsUserScrolling(false);
    }
  };

  if (conversations === undefined) {
    return (
      <div className="flex h-full">
        {/* Sidebar Skeleton */}
        <div className="w-64 border-r bg-background">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Chat Area Skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-12 w-40 mx-auto rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Get current conversation title for mobile header
  const currentTitle = conversations?.find(c => c._id === currentConversationId)?.title;

  return (
    <TooltipProvider>
      <div className="flex h-full">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <ConversationSidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            disabled={isStreaming}
            isMobile={false}
          />
        )}

        {/* Mobile Sheet Sidebar */}
        {isMobile && (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-[80vw] sm:max-w-sm p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Conversations</SheetTitle>
              </SheetHeader>
              <ConversationSidebar
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
                disabled={isStreaming}
                isMobile={true}
              />
            </SheetContent>
          </Sheet>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative bg-background">
        {currentConversationId ? (
          <>
            {/* Mobile Header */}
            {isMobile && (
              <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open conversations"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <h2 className="font-semibold truncate">{currentTitle || "New Conversation"}</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNewConversation}
                  disabled={isStreaming}
                  aria-label="New conversation"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-16">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Start the conversation</h3>
                    <p className="text-sm">Send a message to begin chatting with your AI assistant</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                    />
                  ))
                )}
                {isStreaming && messages[messages.length - 1]?.content === '' && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center">
                      <div className="h-4 w-4 rounded-full bg-muted-foreground/20"></div>
                    </div>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 border">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scroll to bottom button */}
            {isUserScrolling && (
              <div className="absolute bottom-20 md:bottom-24 right-4 md:right-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
                      onClick={scrollToBottom}
                      aria-label="Scroll to bottom"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Scroll to bottom</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Input Form */}
            <SimplePromptForm
              input={input}
              onInputChange={setInput}
              onSubmit={handleSendMessage}
              disabled={isStreaming}
            />
          </>
        ) : (
          <>
            {/* Mobile Header for Empty State */}
            {isMobile && (
              <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open conversations"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex-1 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold">AI Chat</h2>
                </div>
              </div>
            )}
            
            <div className="flex-1 flex items-center justify-center p-4 md:p-6">
              <div className="text-center max-w-lg">
                <div className="mb-6 md:mb-8">
                  <div className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">Welcome to AI Chat</h3>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed px-4">
                    Start a new conversation to chat with your AI assistant.
                    Get help with coding, writing, analysis, and more.
                  </p>
                </div>
                <Button onClick={handleNewConversation} size="lg" className="h-12 px-8">
                  <Plus className="h-5 w-5 mr-2" />
                  Start New Conversation
                </Button>
                {!isMobile && (
                  <p className="text-sm text-muted-foreground mt-6">
                    Keyboard shortcut: <kbd className="px-2 py-1 rounded bg-muted text-xs">Ctrl+Shift+C</kbd>
                  </p>
                )}
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </TooltipProvider>
  );
}