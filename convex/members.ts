import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";


const populateUser = async (ctx: QueryCtx, id: Id<"users">) => {
  return await ctx.db.get(id);
};

export const getById = query({
  args: {
    id: v.id("members"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    } 

    const member = await ctx.db.get(args.id);

    if (!member) {
      return null;
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) => 
        q.eq("workspaceId", member.workspaceId).eq("userId", userId),
    ).
    unique();

    if (!currentMember) {
      return null;
    }

    const user = await populateUser(ctx, member.userId);

    if (!user) {
      return null;
    }

    return {
      ...member,
      user
    };
  }
})

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

export const update = mutation({
  args: {
    id: v.id("members"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("unauthorized");
    }

    const member = await ctx.db.get(args.id);

    if (!member) {
      throw new Error("member not found");
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) => 
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember || currentMember.role !== "admin") {
      throw new Error("unauthorized");
    }

    await ctx.db.patch(args.id, {
      role: args.role
    });

    return args.id;
  }
});

export const remove = mutation({
  args: {
    id: v.id("members"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("unauthorized");
    }

    const member = await ctx.db.get(args.id);

    if (!member) {
      throw new Error("member not found");
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) => 
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember) {
      throw new Error("unauthorized");
    }

    if (member.role === "admin") {
      throw new Error("admin cannot be removed");
    }

    if (currentMember._id === args.id && currentMember.role === "admin") {
      throw new Error("cannot remove self if self is an admin");
    }
    
    const [messages, reactions, conversations] = await Promise.all([
      ctx.db.query("messages").withIndex("by_member_id", (q) => q.eq("memberId", member._id)).collect(),
      ctx.db.query("reactions").withIndex("by_member_id", (q) => q.eq("memberId", member._id)).collect(),
      ctx.db.query("conversations")
        .filter((q) => q.or(
          q.eq(q.field("memberOneId"), member._id),
          q.eq(q.field("memberTwoId"), member._id),
        ))
        .collect(),
        // TODO: Delete threads
    ]);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    await ctx.db.delete(args.id);

    // TODO: Remove member
    

    return args.id;
  }
});