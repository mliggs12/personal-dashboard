import { query, QueryCtx } from "./_generated/server";
import { getCurrentUser } from "./userHelpers";

export const current = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    return await getCurrentUser(ctx);
  },
});
