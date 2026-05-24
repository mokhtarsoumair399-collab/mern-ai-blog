import type { Response } from "express";
import { env } from "../config/env.js";
import { User, type UserDocument } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { signToken } from "../utils/jwt.js";
import { loginSchema, profileSchema, registerSchema } from "../validation/auth.schema.js";

function setAuthCookie(res: Response, userId: string) {
  res.cookie(env.COOKIE_NAME, signToken(userId), {
    httpOnly: true,
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function sanitizeUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    role: user.role
  };
}

export const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const exists = await User.exists({ email: input.email });
  if (exists) throw new HttpError(409, "Email is already registered");

  const user = await User.create(input);
  setAuthCookie(res, user._id.toString());
  res.status(201).json({ user: sanitizeUser(user), message: "Account created" });
});

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = (await User.findOne({ email: input.email }).select("+password")) as UserDocument | null;
  if (!user || !(await user.comparePassword(input.password))) {
    throw new HttpError(401, "Invalid email or password");
  }

  setAuthCookie(res, user._id.toString());
  res.json({ user: sanitizeUser(user), message: "Welcome back" });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(env.COOKIE_NAME);
  res.json({ message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?.id);
  if (!user) throw new HttpError(404, "User not found");
  res.json({ user: sanitizeUser(user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const input = profileSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(req.user?.id, input, { new: true });
  if (!user) throw new HttpError(404, "User not found");
  res.json({ user: sanitizeUser(user), message: "Profile updated" });
});
