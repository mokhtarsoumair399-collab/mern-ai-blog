import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Mail, Search, Sparkles, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FeaturedPost } from "../components/blog/FeaturedPost";
import { PostCard } from "../components/blog/PostCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { postApi } from "../lib/api";
import type { BlogMeta, Post } from "../types";

export function HomePage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["posts", "home"],
    queryFn: async () => (await postApi.list({ limit: "6" })).data.posts as Post[]
  });
  const { data: meta } = useQuery({
    queryKey: ["blog-meta"],
    queryFn: async () => (await postApi.meta()).data as BlogMeta
  });

  const featuredPost = meta?.featured[0] ?? data?.[0];
  const secondaryPosts = data?.filter((post) => post._id !== featuredPost?._id).slice(0, 6) ?? [];

  return (
    <div className="space-y-12">
      <section className="grid gap-8 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <Badge className="bg-primary text-white">
            <Sparkles size={14} /> Professional AI-assisted publishing
          </Badge>
          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">AI MERN Blog</h1>
          <p className="max-w-2xl text-lg leading-8 text-foreground/70">
            A production-ready editorial platform for publishing polished technical articles, organizing knowledge,
            and drafting faster with Gemini-assisted workflows.
          </p>
          <form
            className="flex max-w-2xl gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              navigate(`/blog?search=${encodeURIComponent(String(form.get("search") ?? ""))}`);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-foreground/45" size={17} />
              <input
                name="search"
                className="h-12 w-full rounded-md border border-border bg-background pl-10 pr-3 outline-none focus:ring-2 focus:ring-primary/35"
                placeholder="Search posts"
              />
            </div>
            <button className="rounded-md bg-primary px-5 font-bold text-white">Search</button>
          </form>
          <div className="grid max-w-2xl grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-border p-3">
              <div className="font-black">{data?.length ?? 0}+</div>
              <div className="text-foreground/60">Latest posts</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="font-black">{meta?.categories.length ?? 0}</div>
              <div className="text-foreground/60">Categories</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="font-black">{meta?.tags.length ?? 0}</div>
              <div className="text-foreground/60">Topics</div>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-lg border border-border bg-muted shadow-soft">
          <img
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80"
            alt="Editorial desk with notes and writing tools"
            className="h-[420px] w-full object-cover"
          />
          <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-background/90 p-4 shadow-soft backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-black text-primary">
              <BookOpen size={16} /> Editor workflow
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground/70">
              Draft in Markdown, generate outlines, publish with SEO metadata, and monitor your archive from one dashboard.
            </p>
          </div>
        </div>
      </section>

      {isLoading ? <Skeleton className="h-[420px]" /> : featuredPost && <FeaturedPost post={featuredPost} />}

      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border p-5">
          <div className="mb-4 flex items-center gap-2 font-black">
            <TrendingUp size={18} className="text-accent" /> Popular Topics
          </div>
          <div className="flex flex-wrap gap-2">
            {(meta?.tags ?? []).slice(0, 14).map((tag) => (
              <Link key={tag.name} to={`/blog?tag=${tag.name}`}>
                <Badge>
                  #{tag.name} <span className="ml-1 text-foreground/45">{tag.count}</span>
                </Badge>
              </Link>
            ))}
            {!meta?.tags.length && <span className="text-sm text-foreground/60">Publish posts to build your topic index.</span>}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 p-5">
          <div className="mb-3 flex items-center gap-2 font-black">
            <Mail size={18} className="text-primary" /> Newsletter
          </div>
          <p className="text-sm leading-6 text-foreground/70">Subscribe form-ready section for weekly technical notes and product essays.</p>
          <div className="mt-4 flex gap-2">
            <input className="h-10 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none" placeholder="you@example.com" />
            <Button type="button">Join</Button>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Latest Posts</h2>
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
            View archive <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-80" />)
            : secondaryPosts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      </section>
    </div>
  );
}
