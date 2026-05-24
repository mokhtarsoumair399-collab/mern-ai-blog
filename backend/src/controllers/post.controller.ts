import { Post } from "../models/Post.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createUniqueSlug } from "../utils/slug.js";
import { HttpError } from "../utils/httpError.js";
import { postSchema } from "../validation/post.schema.js";
import type { SortOrder } from "mongoose";

export const listPosts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 9, 1), 30);
  const query: Record<string, unknown> = { status: "published" };
  const sort: Record<string, SortOrder> =
    req.query.sort === "popular"
      ? { views: -1, createdAt: -1 }
      : req.query.sort === "oldest"
        ? { createdAt: 1 }
        : { createdAt: -1 };

  if (req.query.category) query.category = String(req.query.category).toLowerCase();
  if (req.query.tag) query.tags = String(req.query.tag).toLowerCase();
  if (req.query.featured === "true") query.featured = true;
  if (req.query.search) query.$text = { $search: String(req.query.search) };

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate("author", "name avatar bio")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Post.countDocuments(query)
  ]);

  res.json({ posts, page, pages: Math.ceil(total / limit), total });
});

export const listMine = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.user?.id }).sort({ updatedAt: -1 });
  const stats = {
    total: posts.length,
    published: posts.filter((post) => post.status === "published").length,
    drafts: posts.filter((post) => post.status === "draft").length,
    views: posts.reduce((sum, post) => sum + (post.views ?? 0), 0)
  };
  res.json({ posts, stats });
});

export const getPostMeta = asyncHandler(async (_req, res) => {
  const [categories, tags, featured] = await Promise.all([
    Post.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }
    ]),
    Post.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 20 }
    ]),
    Post.find({ status: "published", featured: true })
      .populate("author", "name avatar bio")
      .sort({ createdAt: -1 })
      .limit(4)
  ]);

  res.json({
    categories: categories.map((item) => ({ name: item._id, count: item.count })),
    tags: tags.map((item) => ({ name: item._id, count: item.count })),
    featured
  });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { slug: req.params.slug, status: "published" },
    { $inc: { views: 1 } },
    { new: true }
  ).populate("author", "name avatar bio");
  if (!post) throw new HttpError(404, "Post not found");

  const related = await Post.find({
    _id: { $ne: post._id },
    status: "published",
    $or: [{ category: post.category }, { tags: { $in: post.tags } }]
  })
    .populate("author", "name avatar bio")
    .sort({ createdAt: -1 })
    .limit(3);

  res.json({ post, related });
});

export const getAuthor = asyncHandler(async (req, res) => {
  const author = await User.findById(req.params.id).select("name avatar bio createdAt");
  if (!author) throw new HttpError(404, "Author not found");

  const posts = await Post.find({ author: author._id, status: "published" })
    .select("title slug metaDescription content excerpt featuredImage featured views category tags status createdAt updatedAt")
    .sort({ createdAt: -1 });

  res.json({ author, posts });
});

export const createPost = asyncHandler(async (req, res) => {
  const input = postSchema.parse(req.body);
  const post = await Post.create({
    ...input,
    category: input.category.toLowerCase(),
    tags: input.tags.map((tag) => tag.toLowerCase()),
    slug: await createUniqueSlug(input.title),
    author: req.user?.id
  });
  res.status(201).json({ post, message: "Post created" });
});

export const updatePost = asyncHandler(async (req, res) => {
  const input = postSchema.parse(req.body);
  const post = await Post.findOne({ _id: req.params.id, author: req.user?.id });
  if (!post) throw new HttpError(404, "Post not found");

  post.set({
    ...input,
    category: input.category.toLowerCase(),
    tags: input.tags.map((tag) => tag.toLowerCase()),
    slug: await createUniqueSlug(input.title, post._id.toString())
  });
  await post.save();
  res.json({ post, message: "Post updated" });
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user?.id });
  if (!post) throw new HttpError(404, "Post not found");
  res.json({ message: "Post deleted" });
});

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, "No image uploaded");
  res.status(201).json({ url: `/uploads/${req.file.filename}`, message: "Image uploaded" });
});
