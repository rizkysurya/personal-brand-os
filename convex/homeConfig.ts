import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Singleton "homepage appearance" config for the custom portfolio homepage:
// hero copy, section headings, skills, stats, theme accent colours, and
// per-section show/hide + order. Read publicly by the homepage; written only by
// a logged-in admin. Mirrors the settings.ts pattern.

export const get = query({
  args: {},
  handler: async (ctx) => ctx.db.query("homeConfig").first(),
});

const FIELDS = {
  // hero
  heroEyebrow: v.optional(v.string()),
  heroName: v.optional(v.string()),
  heroHighlight: v.optional(v.string()),
  heroSubtext: v.optional(v.string()),
  heroPrimaryLabel: v.optional(v.string()),
  heroPrimaryHref: v.optional(v.string()),
  heroSecondaryLabel: v.optional(v.string()),
  heroSecondaryHref: v.optional(v.string()),
  showreelTitle: v.optional(v.string()),
  showreelSubtitle: v.optional(v.string()),
  // section headings
  workEyebrow: v.optional(v.string()),
  workTitle: v.optional(v.string()),
  aboutEyebrow: v.optional(v.string()),
  aboutTitle: v.optional(v.string()),
  aboutBody: v.optional(v.string()),
  servicesEyebrow: v.optional(v.string()),
  servicesTitle: v.optional(v.string()),
  contactTitle: v.optional(v.string()),
  contactSubtext: v.optional(v.string()),
  contactPrimaryLabel: v.optional(v.string()),
  // lists
  skills: v.optional(v.array(v.string())),
  stats: v.optional(v.array(v.object({ value: v.string(), label: v.string() }))),
  // theme accent colours
  accent: v.optional(v.string()),
  accent2: v.optional(v.string()),
  // per-section show/hide + order
  sections: v.optional(
    v.array(v.object({ id: v.string(), enabled: v.boolean(), order: v.number() })),
  ),
};

// Upsert the singleton homeConfig row. Admin-only.
export const upsert = mutation({
  args: FIELDS,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Harus login sebagai admin.");

    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(args)) {
      if (val !== undefined) patch[k] = val;
    }

    const existing = await ctx.db.query("homeConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return ctx.db.insert("homeConfig", patch);
  },
});
