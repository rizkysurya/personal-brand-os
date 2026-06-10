import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { notionTables } from "./features/notion/_schema";

// Personal Brand OS — full schema (Convex Cloud target).
// authTables = @convex-dev/auth. Content tables mirror the localStorage shape
// the frontend store used, so the Convex-backed store adapter maps 1:1.
export default defineSchema({
  ...authTables,
  ...notionTables,

  posts: defineTable({
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    cover: v.string(),
    tag: v.string(),
    author: v.string(),
    status: v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published")),
    publishedAt: v.number(),
    views: v.number(),
    readMin: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status_publishedAt", ["status", "publishedAt"]),

  portfolio: defineTable({
    slug: v.string(),
    title: v.string(),
    category: v.string(),
    cover: v.string(),
    videoUrl: v.optional(v.string()),
    blurb: v.string(),
    problem: v.string(),
    approach: v.string(),
    result: v.string(),
    publishedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_publishedAt", ["publishedAt"]),

  services: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    priceLabel: v.string(),
    period: v.string(),
    bullets: v.array(v.string()),
    featured: v.boolean(),
  }).index("by_slug", ["slug"]),

  resources: defineTable({
    title: v.string(),
    description: v.string(),
    fileLabel: v.string(),
    gated: v.boolean(),
    downloads: v.number(),
  }),

  leads: defineTable({
    name: v.string(),
    email: v.string(),
    topic: v.string(),
    source: v.string(),
    message: v.optional(v.string()),
    ts: v.number(),
    status: v.union(v.literal("new"), v.literal("contacted"), v.literal("closed")),
  })
    .index("by_status_ts", ["status", "ts"])
    .index("by_email", ["email"]),

  comments: defineTable({
    postId: v.id("posts"),
    postTitle: v.string(),
    author: v.string(),
    email: v.string(),
    body: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("spam")),
    aiFlag: v.optional(v.union(v.literal("spam"), v.literal("toxic"), v.null())),
    ts: v.number(),
  })
    .index("by_post", ["postId", "ts"])
    .index("by_status_ts", ["status", "ts"]),

  subscribers: defineTable({
    email: v.string(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("unsubscribed")),
    source: v.string(),
    ts: v.number(),
  }).index("by_email", ["email"]),

  chatSessions: defineTable({
    visitorId: v.string(),
    startedAt: v.number(),
    flagged: v.boolean(),
  })
    .index("by_visitor", ["visitorId"])
    .index("by_flagged_startedAt", ["flagged", "startedAt"]),

  chatMessages: defineTable({
    sessionId: v.id("chatSessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    ts: v.number(),
  }).index("by_session_ts", ["sessionId", "ts"]),

  // Page-builder + landing: complex nested structures stored as blobs keyed by
  // the frontend's string id (PageEntry.id / LandingSection.id).
  pages: defineTable({
    entryId: v.string(),
    slug: v.string(),
    data: v.any(),
  })
    .index("by_entryId", ["entryId"])
    .index("by_slug", ["slug"]),

  landingSections: defineTable({
    sectionId: v.string(),
    data: v.any(),
  }).index("by_sectionId", ["sectionId"]),

  // Singleton site config — everything the owner sets via the onboarding wizard
  // and admin Settings. One row. Favicon/logo are Convex storage ids.
  siteSettings: defineTable({
    siteName: v.optional(v.string()),
    tagline: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    brandColor: v.optional(v.string()),
    themeDefault: v.optional(v.string()), // "light" | "dark" | "system"
    logoUrl: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    socials: v.optional(v.string()), // JSON string
    seoDescription: v.optional(v.string()),
    analyticsId: v.optional(v.string()),
    onboardedAt: v.optional(v.number()),
  }),

  // Homepage "appearance" config (custom portfolio homepage) — singleton row.
  // Hero copy, section headings, skills, stats, theme accent colours, and
  // per-section show/hide + order. Edited from /admin (Tampilan Beranda).
  homeConfig: defineTable({
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
    showreelUrl: v.optional(v.string()),
    cvUrl: v.optional(v.string()),
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
    skills: v.optional(v.array(v.string())),
    stats: v.optional(v.array(v.object({ value: v.string(), label: v.string() }))),
    accent: v.optional(v.string()),
    accent2: v.optional(v.string()),
    education: v.optional(v.array(v.object({ year: v.string(), title: v.string(), place: v.string() }))),
    experience: v.optional(v.array(v.object({ period: v.string(), role: v.string(), place: v.string() }))),
    sections: v.optional(
      v.array(v.object({ id: v.string(), enabled: v.boolean(), order: v.number() })),
    ),
  }),
});
