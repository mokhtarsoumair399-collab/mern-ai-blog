import { ArrowRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCount, getImageUrl, readingTime } from "../../lib/utils";
import type { Post } from "../../types";
import { Badge } from "../ui/Badge";

export function FeaturedPost({ post }: { post: Post }) {
  return (
    <article className="grid overflow-hidden rounded-lg border border-border bg-background shadow-soft lg:grid-cols-[1fr_0.9fr]">
      <Link to={`/blog/${post.slug}`} className="min-h-[320px] bg-muted">
        {post.featuredImage ? (
          <img src={getImageUrl(post.featuredImage)} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center text-3xl font-black text-foreground/30">
            {post.category}
          </div>
        )}
      </Link>
      <div className="flex flex-col justify-center p-6 md:p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge className="bg-primary text-white">Featured</Badge>
          <Badge>{post.category}</Badge>
        </div>
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-3xl font-black leading-tight hover:text-primary md:text-4xl">{post.title}</h2>
        </Link>
        <p className="mt-4 line-clamp-4 leading-7 text-foreground/70">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-foreground/60">
          <span>{readingTime(post.content)} min read</span>
          <span className="inline-flex items-center gap-1">
            <Eye size={15} /> {formatCount(post.views)} views
          </span>
          <span>By {post.author.name}</span>
        </div>
        <Link to={`/blog/${post.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-primary">
          Read feature <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
