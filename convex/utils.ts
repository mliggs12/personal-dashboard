import { Auth } from "convex/server";
import { ConvexError, v } from "convex/values";
import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./userHelpers";

export const search = query({
  args: { query: v.string() },
  async handler(ctx, { query }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("notes")
      .withSearchIndex("search_title", (q) =>
        q.search("title", query).eq("userId", user._id),
      )
      .collect();
  },
});

export const queryWithUser = customQuery(
  query,
  customCtx(async (ctx) => {
    return {
      userId: await getUserId(ctx),
    };
  }),
);

export const mutationWithUser = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const userId = await getUserId(ctx);
    if (userId === undefined) {
      throw new ConvexError("User must be logged in.");
    }
    return { userId };
  }),
);

async function getUserId(ctx: { auth: Auth }) {
  const authInfo = await ctx.auth.getUserIdentity();
  return authInfo?.tokenIdentifier;
}
