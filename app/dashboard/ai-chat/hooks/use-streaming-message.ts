import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Configuration for context window
const MAX_CONTEXT_MESSAGES = 20; // Last N messages to include in context

/**
 * Implements sliding window context to prevent sending entire conversation history
 * Keeps last N messages (user/assistant pairs) for context
 */
function getContextMessages(messages: Message[]): Message[] {
  // If we have fewer messages than the limit, send all
  if (messages.length <= MAX_CONTEXT_MESSAGES) {
    return messages;
  }
  
  // Take the last MAX_CONTEXT_MESSAGES messages
  // This ensures we keep recent context while reducing token usage
  return messages.slice(-MAX_CONTEXT_MESSAGES);
}

export function useStreamingMessage() {
  const [isStreaming, setIsStreaming] = useState(false);
  const addMessage = useMutation(api.aiMessages.addMessage);

  const sendMessage = useCallback(async (
    userMessage: string,
    conversationId: Id<"aiConversations">,
    currentMessages: Message[],
    onMessageUpdate: (messages: Message[]) => void
  ) => {
    setIsStreaming(true);
    const startTime = Date.now();
    
    const userMessageId = crypto.randomUUID();
    
    // Add user message to UI
    const messagesWithUser = [
      ...currentMessages,
      { id: userMessageId, role: 'user' as const, content: userMessage }
    ];
    onMessageUpdate(messagesWithUser);

    try {
      // Save user message to database
      await addMessage({
        conversationId,
        content: userMessage,
        role: 'user',
      });

      // Get context messages (sliding window)
      const contextMessages = getContextMessages(messagesWithUser);
      console.log(`[AI Chat] Sending ${contextMessages.length} messages (out of ${messagesWithUser.length} total)`);

      // Call AI API with streaming and retry logic
      let lastError: Error | null = null;
      let attempt = 0;
      const maxRetries = 2;
      
      while (attempt <= maxRetries) {
        try {
          const response = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: contextMessages.map(m => ({ role: m.role, content: m.content })),
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // Don't retry on rate limit or auth errors
            if (response.status === 429 || response.status === 401) {
              throw new Error(errorData.error || 'Failed to get AI response');
            }
            
            // Retry on server errors (500, 503)
            if (response.status >= 500 && attempt < maxRetries) {
              console.log(`[AI Chat] Server error, retrying (attempt ${attempt + 1}/${maxRetries})...`);
              lastError = new Error(errorData.error || 'Server error');
              attempt++;
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
              continue;
            }
            
            throw new Error(errorData.error || 'Failed to get AI response');
          }

          // Successfully got response, break retry loop
          
          // Handle streaming response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let assistantMessage = '';
          const assistantMessageId = crypto.randomUUID();

          // Add empty assistant message
          let updatedMessages = [
            ...messagesWithUser,
            { id: assistantMessageId, role: 'assistant' as const, content: '' }
          ];
          onMessageUpdate(updatedMessages);

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              if (chunk === '[DONE]') break;

              assistantMessage += chunk;
              
              // Update the assistant message in real-time
              updatedMessages = updatedMessages.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: assistantMessage }
                  : msg
              );
              onMessageUpdate(updatedMessages);
            }
          }

          // Save complete assistant message to database
          if (assistantMessage) {
            const duration = Date.now() - startTime;
            console.log(`[AI Chat] Message completed in ${duration}ms, ${assistantMessage.length} chars`);
            
            await addMessage({
              conversationId,
              content: assistantMessage,
              role: 'assistant',
              duration, // Track generation time
              // Note: model name would need to be returned from API for accurate tracking
            });
          } else {
            console.warn('[AI Chat] Empty assistant message received');
          }

          return true;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          
          // If we've exhausted retries, throw
          if (attempt >= maxRetries) {
            throw lastError;
          }
          
          attempt++;
          console.log(`[AI Chat] Error on attempt ${attempt}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
      
      // If we get here, all retries failed
      throw lastError || new Error('Failed after retries');
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[AI Chat] Error after ${duration}ms:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsStreaming(false);
    }
  }, [addMessage]);

  return { sendMessage, isStreaming };
}

