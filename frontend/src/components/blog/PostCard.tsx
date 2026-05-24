import { CalendarDays, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCount, getImageUrl, readingTime } from "../../lib/utils";
import type { Post } from "../../types";
import { Badge } from "../ui/Badge";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-background shadow-soft">
      {post.featuredImage && (
        <Link to={`/blog/${post.slug}`}>
          <img src={getImageUrl(post.featuredImage)} alt="" className="h-48 w-full object-cover" />
        </Link>
      )}
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
          <Badge className="text-primary">{post.category}</Badge>
          {post.featured && <Badge className="bg-accent text-white">Featured</Badge>}
          <span className="inline-flex items-center gap-1 text-foreground/60">
            <CalendarDays size={14} />
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-xl font-black leading-tight hover:text-primary">{post.title}</h2>
        </Link>
        <p className="line-clamp-3 text-sm leading-6 text-foreground/70">{post.excerpt}</p>
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 4).map((tag) => (
            <Link key={tag} to={`/blog?tag=${tag}`} className="rounded bg-muted px-2 py-1 text-xs">
              #{tag}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-border pt-3 text-xs text-foreground/60">
          <span>{readingTime(post.content)} min read</span>
          <span className="inline-flex items-center gap-1">
            <Eye size={14} /> {formatCount(post.views)} views
          </span>
          <span>By {post.author.name}</span>
        </div>
      </div>
    </article>
  );
}
