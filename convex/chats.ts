import { ConvexError, v } from "convex/values";

import { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./userHelpers";

export const getOrCreate = mutation({
  args: { otherUserId: v.id("users") },
  async handler(ctx, { otherUserId }) {
    const user = await getCurrentUserOrThrow(ctx);

    const chat = await ctx.db
      .query("chats")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("chatterOneId"), user._id),
            q.eq(q.field("chatterTwoId"), otherUserId),
          ),
          q.and(
            q.eq(q.field("chatterOneId"), otherUserId),
            q.eq(q.field("chatterTwoId"), user._id),
          ),
        ),
      )
      .unique();

    if (chat) {
      return chat._id;
    }

    const chatId = await ctx.db.insert("chats", {
      chatterOneId: user._id,
      chatterTwoId: otherUserId,
      updated: Date.now(),
    });

    return chatId;
  },
});

export const listByCurrentUser = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const chatsFirstPart = await ctx.db
      .query("chats")
      .withIndex("by_chatterOneId", (q) => q.eq("chatterOneId", user._id))
      .collect();

    const chatsSecondPart = await ctx.db
      .query("chats")
      .withIndex("by_chatterTwoId", (q) => q.eq("chatterTwoId", user._id))
      .collect();

    const chats = [...chatsFirstPart, ...chatsSecondPart];

    return chats;
  },
});

export const getChat = query({
  args: { chatId: v.id("chats") },
  async handler(ctx, { chatId }) {
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new ConvexError("Chat not found");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
      .collect();

    const messagesWithUsersRelation = messages.map(
      async (message: Doc<"messages">) => {
        const user = await ctx.db.get(message.authorId);
        if (!user) {
          throw new ConvexError("User doesn't exist");
        }
        return {
          ...message,
          user,
        };
      },
    );

    const messagesWithUsers = await Promise.all(messagesWithUsersRelation);

    return {
      chat,
      messagesWithUsers,
    };
  },
});
