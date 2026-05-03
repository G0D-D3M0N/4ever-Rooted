import { Link, useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import { LogIn, LogOut, Menu, X, Rocket, Shield, Search, Bell, User, Trophy } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 30000,
  });

  const unread = notifications.filter((n: any) => !n.read).length;

  const markAllMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications/read-all", { method: "PATCH", credentials: "include" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function timeAgo(ts: any) {
    if (!ts) return "";
    const d = new Date(typeof ts === "number" ? ts * 1000 : ts);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(v => !v); if (!open && unread > 0) markAllMutation.mutate(); }}
        className="relative w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
      >
        <Bell className="w-4 h-4 text-gray-400" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-black flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
            style={{ background: "#161616" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <span className="text-sm font-bold text-white">Notifications</span>
              {notifications.length > 0 && (
                <button onClick={() => markAllMutation.mutate()} className="text-[10px] text-gray-500 hover:text-primary transition-colors">Mark all read</button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n: any) => (
                  <div key={n.id} className={cn("flex gap-3 px-4 py-3 border-b border-white/5 last:border-0 transition-colors", !n.read && "bg-primary/3")}>
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.type === "approved" ? "bg-emerald-400" : "bg-red-400")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-300 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const [location] = useLocation();
  const { user, isLoading, signOut } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  const isAdmin = !!user?.isAdmin;

  const links = [
    { href: "/resources", label: "Resources" },
    { href: "/roadmaps", label: "Roadmaps" },
    { href: "/paths", label: "Paths" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/changelog", label: "What's New" },
    { href: "/about", label: "About" },
  ];

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[#121212]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <Rocket className="w-6 h-6 text-primary group-hover:text-primary/80 transition-colors" />
            <span className="font-bold text-xl tracking-tighter text-white group-hover:text-glow transition-all">
              4ever <span className="text-primary">Rooted</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-transparent relative z-10",
                  location === link.href
                    ? "text-primary bg-primary/5"
                    : link.href === "/leaderboard"
                    ? "text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/5"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {location === link.href && (
                  <div className="absolute inset-0 rounded-lg border border-primary/30 shadow-[0_0_15px_rgba(0,243,255,0.2)] -z-10" />
                )}
                {link.href === "/leaderboard" && <Trophy className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ml-1",
                  location === "/admin"
                    ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                    : "text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/8 border-transparent hover:border-amber-500/20"
                )}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right area — Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate("/search")}
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
              title="Search"
            >
              <Search className="w-4 h-4 text-gray-400" />
            </button>

            {isLoading ? (
              <div className="w-20 h-9 bg-white/5 rounded-lg animate-pulse" />
            ) : CLERK_ENABLED ? (
              <>
                <SignedIn>
                  <div className="flex items-center gap-2">
                    {user && <NotificationBell userId={(user as any).id} />}
                    <Link href="/profile">
                      <button className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all" title="Profile">
                        <User className="w-4 h-4 text-gray-400" />
                      </button>
                    </Link>
                    {user && <span className="text-sm text-gray-400 font-mono">@{user.username}</span>}
                    <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 border border-primary/30" } }} />
                  </div>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 hover:border-primary text-sm font-medium transition-all shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                      <LogIn className="w-4 h-4" />
                      Login
                    </button>
                  </SignInButton>
                </SignedOut>
              </>
            ) : user ? (
              <div className="flex items-center gap-2">
                <NotificationBell userId={(user as any).id} />
                <Link href="/profile">
                  <button className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all">
                    <User className="w-4 h-4 text-gray-400" />
                  </button>
                </Link>
                <span className="text-sm text-gray-400 font-mono">@{user.username}</span>
                <button onClick={signOut} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-xs font-medium transition-all hover:text-red-400 border border-transparent hover:border-red-400/20">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 hover:border-primary text-sm font-medium transition-all shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile right */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => navigate("/search")} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Search className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

    </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="md:hidden fixed inset-0 top-16 z-[98] bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="md:hidden fixed top-16 left-0 right-0 z-[99] bg-[#121212] border-b border-white/10 shadow-2xl"
            >
              <div className="px-4 py-4 space-y-2">
                {links.map((link) => (
                  <Link key={link.href} href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      location === link.href
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : link.href === "/leaderboard"
                        ? "text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/8 border border-transparent"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.href === "/leaderboard" && <Trophy className="w-4 h-4 shrink-0" />}
                    {link.label}
                  </Link>
                ))}

                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-400 bg-amber-500/8 border border-amber-500/20" onClick={() => setMobileMenuOpen(false)}>
                    <Shield className="w-4 h-4" /> Admin Panel
                  </Link>
                )}

                {user && (
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-transparent" onClick={() => setMobileMenuOpen(false)}>
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                )}

                <div className="pt-3 border-t border-white/8">
                  {CLERK_ENABLED ? (
                    <>
                      <SignedIn>
                        <div className="flex items-center gap-3 px-3 py-2">
                          <UserButton appearance={{ elements: { avatarBox: "w-7 h-7 border border-primary/30" } }} />
                          {user && <span className="text-sm text-gray-400 font-mono flex-1">@{user.username}</span>}
                          <button
                            onClick={() => { signOut(); setMobileMenuOpen(false); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Sign out
                          </button>
                        </div>
                      </SignedIn>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary/10 text-primary font-semibold rounded-xl border border-primary/25 hover:bg-primary/20 transition-all text-sm" onClick={() => setMobileMenuOpen(false)}>
                            <LogIn className="w-4 h-4" /> Login
                          </button>
                        </SignInButton>
                      </SignedOut>
                    </>
                  ) : user ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2 text-sm text-gray-400 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary uppercase">{user.username?.charAt(0)}</span>
                        </div>
                        @{user.username}
                      </div>
                      <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:bg-red-500/8 rounded-xl border border-transparent hover:border-red-500/15 transition-all text-sm font-medium">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  ) : (
                    <Link href="/login" className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary/10 text-primary font-semibold rounded-xl border border-primary/25 hover:bg-primary/20 transition-all text-sm" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn className="w-4 h-4" /> Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
