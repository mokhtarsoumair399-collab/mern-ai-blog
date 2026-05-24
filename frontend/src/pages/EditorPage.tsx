import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ImagePlus, Save, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { AIGenerator } from "../components/ai/AIGenerator";
import { MarkdownEditor } from "../components/editor/MarkdownEditor";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { postApi } from "../lib/api";
import type { GeneratedPost, Post, PostPayload } from "../types";

const emptyPost: PostPayload = {
  title: "",
  metaDescription: "",
  content: "",
  excerpt: "",
  category: "general",
  tags: [],
  featuredImage: "",
  featured: false,
  status: "draft"
};

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PostPayload>(emptyPost);
  const [tagText, setTagText] = useState("");

  const { data: mine } = useQuery({
    queryKey: ["my-posts"],
    queryFn: async () => (await postApi.mine()).data.posts as Post[],
    enabled: Boolean(id)
  });

  const editingPost = useMemo(() => mine?.find((post) => post._id === id), [mine, id]);

  useEffect(() => {
    if (!editingPost) return;
    setForm({
      title: editingPost.title,
      metaDescription: editingPost.metaDescription,
      content: editingPost.content,
      excerpt: editingPost.excerpt,
      category: editingPost.category,
      tags: editingPost.tags,
      featuredImage: editingPost.featuredImage,
      featured: editingPost.featured,
      status: editingPost.status
    });
    setTagText(editingPost.tags.join(", "));
  }, [editingPost]);

  const saveMutation = useMutation({
    mutationFn: (payload: PostPayload) => (id ? postApi.update(id, payload) : postApi.create(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      toast.success(id ? "Post updated" : "Post created");
      navigate("/dashboard");
    },
    onError: (error: any) => toast.error(error.response?.data?.message ?? "Unable to save post")
  });

  const uploadMutation = useMutation({
    mutationFn: postApi.upload,
    onSuccess: (response) => {
      setForm((current) => ({ ...current, featuredImage: response.data.url }));
      toast.success("Image uploaded");
    }
  });

  function applyGenerated(post: GeneratedPost) {
    setForm((current) => ({
      ...current,
      title: post.title,
      metaDescription: post.metaDescription,
      content: post.content,
      excerpt: post.metaDescription,
      tags: post.tags,
      category: post.tags[0] ?? current.category
    }));
    setTagText(post.tags.join(", "));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const tags = tagText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    saveMutation.mutate({ ...form, tags });
  }

  const tags = tagText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const checks = [
    { label: "Title is 40-70 characters", done: form.title.length >= 40 && form.title.length <= 70 },
    { label: "Meta description is 120-160 characters", done: form.metaDescription.length >= 120 && form.metaDescription.length <= 160 },
    { label: "Article has at least 600 characters", done: form.content.length >= 600 },
    { label: "Three or more tags", done: tags.length >= 3 },
    { label: "Featured image added", done: Boolean(form.featuredImage) }
  ];
  const score = checks.filter((check) => check.done).length;

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <Input
            placeholder="Category"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
          />
        </div>
        <Textarea
          placeholder="Meta description"
          value={form.metaDescription}
          onChange={(event) => setForm({ ...form, metaDescription: event.target.value })}
        />
        <Textarea placeholder="Excerpt" value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} />
        <MarkdownEditor value={form.content} onChange={(content) => setForm({ ...form, content })} />
      </div>

      <div className="space-y-4">
        <AIGenerator onInsert={applyGenerated} />
        <div className="rounded-lg border border-border p-4">
          <div className="mb-3 font-black">Publish Settings</div>
          <div className="space-y-3">
            <Input placeholder="tag-one, tag-two" value={tagText} onChange={(event) => setTagText(event.target.value)} />
            <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PostPayload["status"] })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => setForm({ ...form, featured: event.target.checked })}
              />
              <Star size={16} className="text-accent" /> Feature on homepage
            </label>
            <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border text-sm font-bold">
              <ImagePlus size={16} />
              Featured image
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => event.target.files?.[0] && uploadMutation.mutate(event.target.files[0])}
              />
            </label>
            {form.featuredImage && <p className="break-all text-xs text-foreground/60">{form.featuredImage}</p>}
            <Button className="w-full" disabled={saveMutation.isPending}>
              <Save size={16} /> {saveMutation.isPending ? "Saving..." : "Save post"}
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="mb-3 font-black">Editorial Quality</div>
          <div className="mb-4 h-2 overflow-hidden rounded bg-muted">
            <div className="h-full bg-primary" style={{ width: `${(score / checks.length) * 100}%` }} />
          </div>
          <div className="space-y-2">
            {checks.map((check) => (
              <div key={check.label} className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className={check.done ? "text-primary" : "text-foreground/25"} />
                <span className={check.done ? "" : "text-foreground/55"}>{check.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
