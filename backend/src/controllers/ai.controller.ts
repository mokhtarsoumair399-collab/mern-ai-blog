import { asyncHandler } from "../utils/asyncHandler.js";
import { generateBlogPost } from "../utils/gemini.js";
import { generatePostSchema } from "../validation/post.schema.js";

export const generatePost = asyncHandler(async (req, res) => {
  const input = generatePostSchema.parse(req.body);
  const post = await generateBlogPost(input);
  res.json({ post });
});
