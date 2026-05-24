import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(5).max(140),
  metaDescription: z.string().min(20).max(180),
  content: z.string().min(50),
  excerpt: z.string().min(20).max(260),
  category: z.string().min(2).max(60),
  tags: z.array(z.string().min(1).max(40)).max(10).default([]),
  featuredImage: z.string().optional().default(""),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft")
});

export const generatePostSchema = z.object({
  topic: z.string().min(3).max(160),
  tone: z.string().min(3).max(80).default("helpful and practical"),
  length: z.enum(["short", "medium", "long"]).default("medium")
});
