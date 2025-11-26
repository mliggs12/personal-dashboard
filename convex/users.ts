import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

import { internalMutation, mutation, query, QueryCtx } from "./_generated/server";

export const current = query({
  async handler(ctx: QueryCtx) {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      externalId: data.id,
      timezone: "America/Denver", // Default timezone for new users
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      // Only update name and externalId, preserve existing timezone if set
      await ctx.db.patch(user._id, {
        name: userAttributes.name,
        externalId: userAttributes.externalId,
        // Only set timezone if user doesn't have one
        ...(user.timezone === undefined && { timezone: userAttributes.timezone }),
      });
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});

export const get = query({
  args: { userId: v.id("users") },
  async handler(ctx, { userId }) {
    return await ctx.db.get(userId);
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Couldn't get `UserIdentity` from the Convex client")
  return await userByExternalId(ctx, identity.subject);
}

export async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}

/**
 * Gets the user's timezone from the database.
 * Falls back to "America/Denver" if not set.
 * This is the single source of truth for timezone in Convex context.
 * 
 * @param ctx - Convex query or mutation context
 * @returns IANA timezone string (e.g., "America/Denver", "America/New_York")
 */
export async function getUserTimezone(ctx: QueryCtx): Promise<string> {
  const user = await getCurrentUserOrThrow(ctx);
  return user.timezone ?? "America/Denver";
}

/**
 * Mutation to update the user's timezone preference.
 */
export const updateTimezone = mutation({
  args: {
    timezone: v.string(), // IANA timezone string
  },
  async handler(ctx, { timezone }) {
    const user = await getCurrentUserOrThrow(ctx);
    await ctx.db.patch(user._id, { timezone });
  },
});

/**
 * Migration function to set default timezone for all existing users without one.
 * 
 * This should be run once after deploying the timezone field to the schema.
 * 
 * To run from Convex Dashboard:
 * 1. Go to Functions tab
 * 2. Find "users.migrateUserTimezones"
 * 3. Click "Run Function"
 * 4. Optionally provide a defaultTimezone (defaults to "America/Denver")
 * 5. Click "Run"
 * 
 * @param defaultTimezone - Optional IANA timezone string (defaults to "America/Denver")
 * @returns Summary of migration results
 */
export const migrateUserTimezones = mutation({
  args: {
    defaultTimezone: v.optional(v.string()), // Optional, defaults to "America/Denver"
  },
  async handler(ctx, { defaultTimezone = "America/Denver" }) {
    const allUsers = await ctx.db.query("users").collect();
    
    let migratedCount = 0;
    const migratedUserIds: string[] = [];
    
    for (const user of allUsers) {
      if (user.timezone === undefined) {
        await ctx.db.patch(user._id, { timezone: defaultTimezone });
        migratedCount++;
        migratedUserIds.push(user._id);
      }
    }
    
    return {
      totalUsers: allUsers.length,
      migratedCount,
      defaultTimezone,
      migratedUserIds,
      message: `Successfully migrated ${migratedCount} of ${allUsers.length} users to timezone "${defaultTimezone}"`,
    };
  },
});