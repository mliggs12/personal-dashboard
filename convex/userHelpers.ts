import { Doc } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";

export async function getCurrentUser(
  ctx: QueryCtx,
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByTokenId(ctx, identity.tokenIdentifier);
}

async function userByTokenId(ctx: QueryCtx, tokenId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenId))
    .unique();
}
