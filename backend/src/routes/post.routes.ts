import { Router } from "express";
import {
  createPost,
  deletePost,
  getAuthor,
  getPostMeta,
  getPost,
  listMine,
  listPosts,
  updatePost,
  uploadImage
} from "../controllers/post.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

export const postRouter = Router();

postRouter.get("/", listPosts);
postRouter.get("/mine", requireAuth, listMine);
postRouter.get("/meta", getPostMeta);
postRouter.get("/author/:id", getAuthor);
postRouter.get("/:slug", getPost);
postRouter.post("/", requireAuth, createPost);
postRouter.put("/:id", requireAuth, updatePost);
postRouter.delete("/:id", requireAuth, deletePost);
postRouter.post("/upload", requireAuth, upload.single("image"), uploadImage);
