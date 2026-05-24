import { Moon, PenSquare, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

export function Header() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-black">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-white">AI</span>
          MERN Blog
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex">
          <NavLink to="/blog" className={({ isActive }) => (isActive ? "font-bold text-primary" : "")}>
            Blog
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "font-bold text-primary" : "")}>
              Dashboard
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" aria-label="Toggle dark mode" onClick={() => setDark((value) => !value)}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          {user ? (
            <>
              <Link to="/editor">
                <Button>
                  <PenSquare size={16} /> New
                </Button>
              </Link>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
