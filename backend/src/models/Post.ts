import mongoose, { Schema, type InferSchemaType } from "mongoose";

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, index: true },
    metaDescription: { type: String, required: true, maxlength: 180 },
    content: { type: String, required: true },
    excerpt: { type: String, required: true, maxlength: 260 },
    category: { type: String, required: true, trim: true, lowercase: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    featuredImage: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" }
  },
  { timestamps: true }
);

postSchema.index({ title: "text", content: "text", tags: "text", category: "text" });

export type PostDocument = InferSchemaType<typeof postSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Post = mongoose.model("Post", postSchema);
