import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const join = mutation({
  args: {
    joinCode: v.string(),
    workspaceId: v.id("workspaces")
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const workspace = await ctx.db.get(args.workspaceId);

    if (!workspace) {
      throw new Error("workspace not found");
    }

    if (workspace.joinCode !== args.joinCode.toLowerCase()) {
      throw new Error("Invalid join code");
    }

    const existingMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) => 
        q
        .eq("workspaceId", args.workspaceId)
        .eq("userId", userId)
      )
      .unique();

    if (existingMember) {
      throw new Error("Already a member of workspace");
    }

    await ctx.db.insert("members", {
      userId,
      workspaceId: workspace._id,
      role: "member"
    });

    return workspace._id;
  }
});

export const newJoinCode = mutation({
  args: {
    workspaceId: v.id("workspaces")
  },
  handler: async(ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) => 
        q
        .eq("workspaceId", args.workspaceId)
        .eq("userId", userId)
      )
      .unique();
    
    if (!member || member.role !== "admin") {
      throw new Error("unauthorized");
    }

    const newCode = generateCode();
    await ctx.db.patch(args.workspaceId, {
      joinCode: newCode,
    });

    return args.workspaceId;
  }
})

const generateCode = () => {
  const code = Array.from(
    {length: 6},
    () => 
      "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
  ).join('');

  return code;
};

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("unauthorized");
    }

    const joinCode =  generateCode();
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      joinCode,
    });

    await ctx.db.insert("members", {
      userId,
      workspaceId,
      role: "admin",
    });

    await ctx.db.insert("channels", {
      name: "general",
      workspaceId,
    })

    return workspaceId;
  } 
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    
    if (!userId) {
      return [];
    }

    const members = await ctx.db
      .query('members')
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    const workspaceIds = members.map((member) => member.workspaceId);
    const workspaces = await ctx.db
    .query("workspaces")
    .filter(q => q.or(...workspaceIds.map(id => q.eq(q.field("_id"), id))))
    .collect();

    return workspaces;
  }
});

export const getInfoById = query({
  args: {id: v.id("workspaces")},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw null;
    }

    const member = await ctx.db
      .query('members')
      .withIndex("by_workspace_id_user_id", (q) => 
        q
        .eq("workspaceId", args.id)
        .eq("userId", userId)
      )
      .unique();

    const workspace = await ctx.db.get(args.id);

    return {
      name: workspace?.name,
      isMember: !!member,
    }
  }
})

export const getById = query({
  args: {id: v.id("workspaces")},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    const member = await ctx.db
      .query('members')
      .withIndex("by_workspace_id_user_id", (q) => 
        q
        .eq("workspaceId", args.id)
        .eq("userId", userId)
      )
      .unique();
    
    if (!member) {
      return null;
    }

    return await ctx.db.get(args.id);
  }
})

export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("unauthorized");
    }

    const member = await ctx.db
    .query('members')
    .withIndex("by_workspace_id_user_id", (q) => 
      q
      .eq("workspaceId", args.id)
      .eq("userId", userId)
    )
    .unique();

    if (!member || member.role !== "admin") {
      throw new Error("unauthorized");
    }

    await ctx.db.patch(args.id, {
      name: args.name
    });

    return args.id;
  }
})


export const remove = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("unauthorized");
    }

    const member = await ctx.db
    .query('members')
    .withIndex("by_workspace_id_user_id", (q) => 
      q
      .eq("workspaceId", args.id)
      .eq("userId", userId)
    )
    .unique();

    if (!member || member.role !== "admin") {
      throw new Error("unauthorized");
    }

    let hasMore = true;
    while (hasMore) {
      const batch = await ctx.db
        .query("members")
        .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
        .take(100);
      
      await Promise.all(batch.map(member => ctx.db.delete(member._id)))
      hasMore = batch.length === 100;
    }

    await ctx.db.delete(args.id);

    return args.id;
  }
})