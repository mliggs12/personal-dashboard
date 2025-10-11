import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const create = mutation({
  args: {
    title: v.optional(v.string()),
  },
  async handler(ctx, { title }) {
    const user = await getCurrentUserOrThrow(ctx);

    const conversationId = await ctx.db.insert("aiConversations", {
      title,
      updated: Date.now(),
      userId: user._id,
    });

    return conversationId;
  },
});

export const list = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const conversations = await ctx.db
      .query("aiConversations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return conversations;
  },
});

export const get = query({
  args: {
    conversationId: v.id("aiConversations"),
  },
  async handler(ctx, { conversationId }) {
    const user = await getCurrentUserOrThrow(ctx);
    
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    if (conversation.userId !== user._id) {
      throw new ConvexError("Unauthorized");
    }

    const messages = await ctx.db
      .query("aiMessages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .order("asc")
      .collect();

    return {
      conversation,
      messages,
    };
  },
});

export const updateTitle = mutation({
  args: { 
    conversationId: v.id("aiConversations"),
    title: v.string(),
  },
  async handler(ctx, { conversationId, title }) {
    const user = await getCurrentUserOrThrow(ctx);
    
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    if (conversation.userId !== user._id) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(conversationId, {
      title,
      updated: Date.now(),
    });
  },
});

export const deleteConversation = mutation({
  args: { conversationId: v.id("aiConversations") },
  async handler(ctx, { conversationId }) {
    const user = await getCurrentUserOrThrow(ctx);
    
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    if (conversation.userId !== user._id) {
      throw new ConvexError("Unauthorized");
    }

    // Delete all messages in the conversation
    const messages = await ctx.db
      .query("aiMessages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the conversation
    await ctx.db.delete(conversationId);
  },
});
