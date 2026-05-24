import bcrypt from "bcryptjs";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

type UserMethods = {
  comparePassword(candidate: string): Promise<boolean>;
};

type UserModel = Model<InferSchemaType<typeof userSchema>, {}, UserMethods>;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    bio: { type: String, default: "", maxlength: 500 },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["author", "admin"], default: "author" }
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export type UserDocument = InferSchemaType<typeof userSchema> &
  UserMethods & {
  _id: mongoose.Types.ObjectId;
};

export const User = mongoose.model<InferSchemaType<typeof userSchema>, UserModel>("User", userSchema);
