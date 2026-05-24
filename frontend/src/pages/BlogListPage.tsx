import { useQuery } from "@tanstack/react-query";
import { Filter, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PostCard } from "../components/blog/PostCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Skeleton } from "../components/ui/Skeleton";
import { postApi } from "../lib/api";
import type { BlogMeta, Post } from "../types";

export function BlogListPage() {
  const [params, setParams] = useSearchParams();
  const query = Object.fromEntries(params.entries());
  const { data, isLoading } = useQuery({
    queryKey: ["posts", query],
    queryFn: async () => (await postApi.list(query)).data as { posts: Post[]; total: number }
  });
  const { data: meta } = useQuery({
    queryKey: ["blog-meta"],
    queryFn: async () => (await postApi.meta()).data as BlogMeta
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black">Article Archive</h1>
          <p className="mt-2 text-foreground/65">Browse posts by category, tag, or search phrase.</p>
        </div>
        <form
          className="grid gap-2 sm:grid-cols-[1fr_150px_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setParams({ ...query, search: String(form.get("search") ?? ""), sort: String(form.get("sort") ?? "latest") });
          }}
        >
          <Input name="search" defaultValue={query.search ?? ""} placeholder="Search" />
          <Select name="sort" defaultValue={query.sort ?? "latest"}>
            <option value="latest">Latest</option>
            <option value="popular">Popular</option>
            <option value="oldest">Oldest</option>
          </Select>
          <Button>
            <Search size={16} /> Search
          </Button>
        </form>
      </div>

      <div className="rounded-lg border border-border p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-black">
          <Filter size={16} /> Filters
        </div>
        <div className="flex flex-wrap gap-2">
          {(meta?.categories ?? []).map((category) => (
            <Button
              key={category.name}
              variant={query.category === category.name ? "primary" : "secondary"}
              onClick={() => setParams({ ...query, category: category.name })}
            >
              {category.name} ({category.count})
            </Button>
          ))}
          {(meta?.tags ?? []).slice(0, 8).map((tag) => (
            <Button key={tag.name} variant={query.tag === tag.name ? "primary" : "secondary"} onClick={() => setParams({ ...query, tag: tag.name })}>
              #{tag.name}
            </Button>
          ))}
          {(query.tag || query.category || query.search || query.sort) && (
            <Button variant="ghost" onClick={() => setParams({})}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-foreground/60">
        <span>{data?.total ?? 0} articles</span>
        {(query.tag || query.category || query.search) && (
          <div className="flex flex-wrap gap-2">
            {query.category && <Badge>{query.category}</Badge>}
            {query.tag && <Badge>#{query.tag}</Badge>}
            {query.search && <Badge>Search: {query.search}</Badge>}
          </div>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-80" />)
          : data?.posts.map((post) => <PostCard key={post._id} post={post} />)}
      </div>
      {!isLoading && data?.posts.length === 0 && <p className="rounded-lg border border-border p-8">No posts found.</p>}
    </div>
  );
}
