import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { PostCard } from "../components/blog/PostCard";
import { Skeleton } from "../components/ui/Skeleton";
import { postApi } from "../lib/api";
import type { Post, User } from "../types";

export function AuthorPage() {
  const { id = "" } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["author", id],
    queryFn: async () => (await postApi.author(id)).data as { author: User; posts: Post[] }
  });

  if (isLoading) return <Skeleton className="h-80 w-full" />;
  if (!data) return <p>Author not found.</p>;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border p-6">
        <h1 className="text-3xl font-black">{data.author.name}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-foreground/70">{data.author.bio || "No author bio yet."}</p>
      </section>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data.posts.map((post) => (
          <PostCard key={post._id} post={{ ...post, author: data.author }} />
        ))}
      </div>
    </div>
  );
}
