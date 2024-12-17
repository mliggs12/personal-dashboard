import { query, QueryCtx } from "./_generated/server";
import { getCurrentUser } from "./userHelpers";

export const current = query({
  async handler(ctx: QueryCtx) {
    return await getCurrentUser(ctx);
  },
});
