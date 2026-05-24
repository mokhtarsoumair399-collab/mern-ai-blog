import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/35">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1fr_auto]">
        <div>
          <div className="font-black">AI MERN Blog</div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-foreground/65">
            A modern publishing workspace for Markdown-first writing, AI-assisted drafting, and polished technical articles.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-bold">
          <Link to="/blog">Archive</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>
    </footer>
  );
}
