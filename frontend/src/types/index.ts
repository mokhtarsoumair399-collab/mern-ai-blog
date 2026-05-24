export type User = {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  bio?: string;
  avatar?: string;
  role?: string;
};

export type Post = {
  _id: string;
  title: string;
  slug: string;
  metaDescription: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  featured: boolean;
  views: number;
  status: "draft" | "published";
  author: User;
  createdAt: string;
  updatedAt: string;
};

export type PostPayload = {
  title: string;
  metaDescription: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  featured: boolean;
  status: "draft" | "published";
};

export type GeneratedPost = {
  title: string;
  metaDescription: string;
  content: string;
  tags: string[];
};

export type BlogMeta = {
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
  featured: Post[];
};

export type MyPostStats = {
  total: number;
  published: number;
  drafts: number;
  views: number;
};
