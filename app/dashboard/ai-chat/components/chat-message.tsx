"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

import { MarkdownMessage } from "../markdown-message";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
          {role === 'user' ? 'U' : 'AI'}
        </AvatarFallback>
      </Avatar>
      
      <Card className={`max-w-[80%] px-4 py-3 ${
        role === 'user' 
          ? 'bg-primary text-primary-foreground border-primary' 
          : 'bg-muted/50 border-border'
      }`}>
        {role === 'assistant' ? (
          <MarkdownMessage content={content} />
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </div>
        )}
      </Card>
    </div>
  );
}

