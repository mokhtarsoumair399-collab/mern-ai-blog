import axios from "axios";
import type { GeneratedPost, PostPayload } from "../types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  withCredentials: true
});

export const authApi = {
  register: (data: { name: string; email: string; password: string }) => api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  updateProfile: (data: { name?: string; bio?: string; avatar?: string }) => api.patch("/auth/profile", data)
};

export const postApi = {
  list: (params?: Record<string, string>) => api.get("/posts", { params }),
  mine: () => api.get("/posts/mine"),
  meta: () => api.get("/posts/meta"),
  get: (slug: string) => api.get(`/posts/${slug}`),
  author: (id: string) => api.get(`/posts/author/${id}`),
  create: (data: PostPayload) => api.post("/posts", data),
  update: (id: string, data: PostPayload) => api.put(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
  upload: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return api.post("/posts/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
  }
};

export const aiApi = {
  generate: (data: { topic: string; tone: string; length: string }) =>
    api.post<{ post: GeneratedPost }>("/ai/generate-post", data)
};
