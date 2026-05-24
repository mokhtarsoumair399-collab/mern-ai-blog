import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Edit, Eye, FileText, Send, Trash2, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../hooks/useAuth";
import { postApi } from "../lib/api";
import { formatCount } from "../lib/utils";
import type { MyPostStats, Post } from "../types";

export function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const { data, isLoading } = useQuery({
    queryKey: ["my-posts"],
    queryFn: async () => (await postApi.mine()).data as { posts: Post[]; stats: MyPostStats }
  });
  const deleteMutation = useMutation({
    mutationFn: postApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      toast.success("Post deleted");
    }
  });
  const posts = data?.posts.filter((post) => status === "all" || post.status === status) ?? [];
  const stats = data?.stats ?? { total: 0, published: 0, drafts: 0, views: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black">Dashboard</h1>
          <p className="mt-2 text-foreground/65">Welcome back, {user?.name}.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/profile">
            <Button variant="secondary">
              <User size={16} /> Profile
            </Button>
          </Link>
          <Link to="/editor">
            <Button>New post</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total posts", value: stats.total, icon: FileText },
          { label: "Published", value: stats.published, icon: Send },
          { label: "Drafts", value: stats.drafts, icon: Edit },
          { label: "Views", value: formatCount(stats.views), icon: Eye }
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/60">{item.label}</span>
              <item.icon size={18} className="text-primary" />
            </div>
            <div className="mt-3 text-3xl font-black">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex flex-col gap-3 border-b border-border bg-muted px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm font-bold">
            <BarChart3 size={16} /> Content Library
          </div>
          <div className="flex gap-2">
            {(["all", "published", "draft"] as const).map((item) => (
              <Button key={item} type="button" variant={status === item ? "primary" : "secondary"} onClick={() => setStatus(item)}>
                {item}
              </Button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="m-4 h-40" />
        ) : (
          posts.map((post) => (
            <div key={post._id} className="grid gap-3 border-b border-border px-4 py-4 last:border-0 md:grid-cols-[1fr_150px_150px_160px] md:items-center">
              <div>
                <div className="font-bold leading-snug">{post.title}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-sm text-foreground/60">
                  <span>{post.category}</span>
                  {post.featured && <Badge className="bg-accent text-white">Featured</Badge>}
                </div>
              </div>
              <span className="text-sm capitalize">{post.status}</span>
              <span className="inline-flex items-center gap-1 text-sm text-foreground/60">
                <Eye size={15} /> {formatCount(post.views)}
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" aria-label="Edit post" onClick={() => navigate(`/editor/${post._id}`)}>
                  <Edit size={15} />
                </Button>
                <Button variant="danger" aria-label="Delete post" onClick={() => deleteMutation.mutate(post._id)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          ))
        )}
        {!isLoading && posts.length === 0 && <div className="p-6 text-foreground/65">No posts found for this filter.</div>}
      </div>
    </div>
  );
}
