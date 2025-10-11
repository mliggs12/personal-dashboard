export const runtime = 'edge';

import { auth } from '@clerk/nextjs/server';

interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OllamaStreamResponse {
  model: string;
  message?: {
    role: string;
    content: string;
  };
  done: boolean;
  error?: string;
}

interface RequestBody {
  messages: OllamaMessage[];
}

// Configuration from environment variables
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gpt-oss:20b';
const OLLAMA_TEMPERATURE = parseFloat(process.env.OLLAMA_TEMPERATURE || '0.7');
const RATE_LIMIT_PER_HOUR = parseInt(process.env.RATE_LIMIT_PER_HOUR || '100');

// In-memory rate limiter for small user base
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  // Clean up old entries periodically (simple cleanup)
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!userLimit || userLimit.resetTime < now) {
    // Reset limit
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + 60 * 60 * 1000, // 1 hour
    });
    return { allowed: true };
  }
  
  if (userLimit.count >= RATE_LIMIT_PER_HOUR) {
    return { allowed: false, resetTime: userLimit.resetTime };
  }
  
  userLimit.count++;
  return { allowed: true };
}

// Validate request body
function validateRequest(body: unknown): body is RequestBody {
  if (!body || typeof body !== 'object') return false;
  const { messages } = body as RequestBody;
  
  if (!Array.isArray(messages) || messages.length === 0) return false;
  
  return messages.every(msg => 
    msg &&
    typeof msg === 'object' &&
    ['user', 'assistant', 'system'].includes(msg.role) &&
    typeof msg.content === 'string'
  );
}

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    // Authenticate user
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      console.log('[AI Chat] Unauthorized request attempt');
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime!);
      console.log(`[AI Chat] Rate limit exceeded for user ${userId}, resets at ${resetDate.toISOString()}`);
      return Response.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: rateLimit.resetTime 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime! - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    const body = await req.json();
    
    // Validate request
    if (!validateRequest(body)) {
      console.log(`[AI Chat] Invalid request from user ${userId}`);
      return Response.json(
        { error: 'Invalid request: messages array is required with valid message objects' },
        { status: 400 }
      );
    }

    const { messages } = body;
    console.log(`[AI Chat] Request from user ${userId}, ${messages.length} messages in context`);

    // Call Ollama API
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: messages as OllamaMessage[],
        stream: true,
        options: {
          temperature: OLLAMA_TEMPERATURE,
          num_predict: -1, // No limit - let the model complete its response naturally
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[AI Chat] Ollama API error (${response.status}):`, error);
      
      // Check if Ollama is running
      if (response.status === 404 || !response.ok) {
        return Response.json(
          { error: `AI service unavailable (${OLLAMA_BASE_URL}). Make sure Ollama is running and accessible.` },
          { status: 503 }
        );
      }
      
      throw new Error(`Ollama API error: ${error}`);
    }

    console.log(`[AI Chat] Streaming started for user ${userId}`);
    
    // Transform the stream
    const encoder = new TextEncoder();
    let streamedChars = 0;
    
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        try {
          const text = new TextDecoder().decode(chunk);
          const lines = text.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data: OllamaStreamResponse = JSON.parse(line);
              
              // Check for errors in the stream
              if (data.error) {
                console.error(`[AI Chat] Stream error for user ${userId}:`, data.error);
                controller.enqueue(encoder.encode(`\n\nError: ${data.error}`));
                controller.terminate();
                return;
              }
              
              // Send only the content chunks
              if (data.message?.content) {
                streamedChars += data.message.content.length;
                controller.enqueue(encoder.encode(data.message.content));
              }
              
              // Signal completion
              if (data.done) {
                const duration = Date.now() - startTime;
                console.log(`[AI Chat] Streaming completed for user ${userId}: ${streamedChars} chars in ${duration}ms`);
                controller.enqueue(encoder.encode('[DONE]'));
              }
            } catch (parseError) {
              // Skip malformed JSON lines
              console.warn('[AI Chat] Skipped malformed JSON:', line.substring(0, 100));
            }
          }
        } catch (error) {
          console.error(`[AI Chat] Transform error for user ${userId}:`, error);
          controller.error(error);
        }
      },
    });

    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering in nginx
      },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[AI Chat] Error after ${duration}ms:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('ECONNREFUSED');
    
    return Response.json(
      { 
        error: isNetworkError 
          ? `Cannot connect to AI service at ${OLLAMA_BASE_URL}. Please ensure Ollama is running.`
          : errorMessage
      },
      { status: isNetworkError ? 503 : 500 }
    );
  }
}

// CORS handler
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
