/**
 * Generates a concise title for a conversation using AI
 * @param messages - Array of messages in the conversation
 * @returns A short, descriptive title (max 50 chars)
 */
export async function generateConversationTitle(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  // Need at least one message to generate a title
  if (messages.length === 0) {
    return "New Conversation";
  }

  // For single message, use a simpler approach
  if (messages.length === 1) {
    const content = messages[0].content.trim();
    return content.slice(0, 50) + (content.length > 50 ? '...' : '');
  }

  try {
    // Prepare context from the first few messages (up to 3 exchanges)
    const contextMessages = messages.slice(0, 6); // 3 user + 3 assistant max
    
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system' as const,
            content: 'You are a helpful assistant that generates very short, concise titles for conversations. Respond with ONLY the title, no quotes, no punctuation at the end, maximum 6 words.'
          },
          ...contextMessages,
          {
            role: 'user' as const,
            content: 'Based on this conversation, generate a short title (maximum 6 words, no quotes):'
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate title');
    }

    // Read the streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let title = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        if (chunk === '[DONE]') break;

        title += chunk;
      }
    }

    // Clean up the title
    title = title
      .trim()
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/[.!?;:]$/, '') // Remove ending punctuation
      .slice(0, 50); // Hard limit

    return title || fallbackTitle(messages[0].content);
  } catch (error) {
    console.error('Error generating title:', error);
    // Fallback to first message excerpt
    return fallbackTitle(messages[0].content);
  }
}

/**
 * Fallback title generator using the first user message
 */
function fallbackTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim();
  return cleaned.slice(0, 50) + (cleaned.length > 50 ? '...' : '');
}

