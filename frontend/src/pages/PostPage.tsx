import { useQuery } from "@tanstack/react-query";
import { Copy, Eye, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { PostCard } from "../components/blog/PostCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { postApi } from "../lib/api";
import { extractToc, formatCount, getImageUrl, readingTime } from "../lib/utils";
import type { Post } from "../types";

function headingId(children: unknown) {
  return String(children).toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

export function PostPage() {
  const { slug = "" } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: async () => (await postApi.get(slug)).data as { post: Post; related: Post[] }
  });

  if (isLoading) return <Skeleton className="h-[600px] w-full" />;
  const post = data?.post;
  if (!post) return <p>Post not found.</p>;

  const toc = extractToc(post.content);
  const authorId = post.author.id ?? post.author._id;
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="space-y-10">
      <article className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary text-white">{post.category}</Badge>
            {post.featured && <Badge className="bg-accent text-white">Featured</Badge>}
          </div>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">{post.title}</h1>
          <p className="max-w-3xl text-lg leading-8 text-foreground/70">{post.metaDescription}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60">
            {authorId && <Link to={`/authors/${authorId}`}>By {post.author.name}</Link>}
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span>{readingTime(post.content)} min read</span>
            <span className="inline-flex items-center gap-1">
              <Eye size={15} /> {formatCount(post.views)} views
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} to={`/blog?tag=${tag}`}>
                <Badge>#{tag}</Badge>
              </Link>
            ))}
          </div>
        </div>
        {post.featuredImage && (
          <img src={getImageUrl(post.featuredImage)} alt="" className="mb-8 max-h-[460px] w-full rounded-lg object-cover" />
        )}
        <div className="prose prose-slate max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
              h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
          <div className="mt-10 rounded-lg border border-border bg-muted/35 p-5">
            <div className="text-sm font-bold uppercase tracking-wide text-primary">About the author</div>
            <h2 className="mt-2 text-xl font-black">{post.author.name}</h2>
            <p className="mt-2 leading-7 text-foreground/70">{post.author.bio || "This author has not added a bio yet."}</p>
          </div>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="mb-3 font-black">On this page</div>
              <div className="space-y-2 text-sm">
                {toc.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className={item.level === 3 ? "block pl-3 text-foreground/60" : "block"}>
                    {item.text}
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center gap-2 font-black">
                <Share2 size={17} /> Share
              </div>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(currentUrl);
                  toast.success("Link copied");
                }}
              >
                <Copy size={16} /> Copy link
              </Button>
            </div>
          </div>
        </aside>
      </article>
      {data.related.length > 0 && (
        <section className="space-y-5 border-t border-border pt-8">
          <h2 className="text-2xl font-black">Related Articles</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {data.related.map((item) => (
              <PostCard key={item._id} post={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
