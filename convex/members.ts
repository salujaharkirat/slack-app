import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const populateUser = async (ctx: QueryCtx, id: Id<"users">) => {
  return await ctx.db.get(id);
};

export const get = query({
  args: { workspaceId: v.id("workspaces")},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const data = await ctx.db
      .query('members')
      .withIndex('by_workspace_id', (q) => 
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();
    
    const members = await Promise.all(
      data.map(async (member) => {
        try {
          const user = await populateUser(ctx, member.userId);
          return user ? { ...member, user } : null;
        } catch (error) {
          console.error(`Failed to populate user ${member.userId}:`, error);
          return null;
        }
      })
    ).then(results => results.filter(Boolean)); // Remove null entries
    
    return members;
  }
})

export const current = query({
  args: { workspaceId: v.id("workspaces")},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const members = await ctx.db
      .query('members')
      .withIndex("by_workspace_id_user_id", (q) => 
        q
        .eq("workspaceId", args.workspaceId)
        .eq("userId", userId)
      )
      .unique();
    
    if (!members) {
      return null;
    }
    return members;
  }
})