import slugify from "slugify";
import { Post } from "../models/Post.js";

export async function createUniqueSlug(title: string, existingId?: string) {
  const base = slugify(title, { lower: true, strict: true, trim: true }) || "post";
  let slug = base;
  let counter = 2;

  while (await Post.exists({ slug, ...(existingId ? { _id: { $ne: existingId } } : {}) })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}
