import { Router } from "express";
import { generatePost } from "../controllers/ai.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const aiRouter = Router();

aiRouter.post("/generate-post", requireAuth, generatePost);
