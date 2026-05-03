import { Link } from "wouter";
import {
  Rocket, Heart, Github, Twitter, Youtube,
  BookOpen, Map, GitFork, Info, LogIn,
  ArrowUpRight, Shield, Zap, MessageCircle,
} from "lucide-react";

const NAV_COLS = [
  {
    heading: "Learn",
    links: [
      { label: "Resources", href: "/resources", icon: BookOpen, external: false },
      { label: "Roadmaps", href: "/roadmaps", icon: Map, external: false },
      { label: "Dev Paths", href: "/paths", icon: GitFork, external: false },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "About", href: "/about", icon: Info, external: false },
      { label: "Login / Sign up", href: "/login", icon: LogIn, external: false },
      { label: "Submit a Resource", href: "/resources", icon: Zap, external: false },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "GitHub", href: "https://github.com/topics/developer-roadmap", icon: Github, external: true },
      { label: "Discord", href: "https://discord.com/invite/programmers", icon: MessageCircle, external: true },
      { label: "YouTube", href: "https://youtube.com/@programmingwithmosh", icon: Youtube, external: true },
    ],
  },
];

const SOCIAL = [
  { icon: Github, href: "https://github.com/topics/developer-roadmap", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com/search?q=developer+roadmap", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com/@programmingwithmosh", label: "YouTube" },
  { icon: MessageCircle, href: "https://discord.com/invite/programmers", label: "Discord" },
];

export function Footer() {
  return (
    <footer className="relative bg-[#0a0a0a] border-t border-white/5 overflow-hidden">

      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,243,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow blob */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-primary/5 blur-[80px]" />

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">

        {/* Top section: brand + nav columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-14">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group cursor-pointer">
              <Rocket className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
              <span className="font-bold text-lg tracking-tighter text-white">
                4ever <span className="text-primary">Rooted</span>
              </span>
            </Link>

            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              A free, community-driven learning platform for developers. Curated resources, structured roadmaps, and zero paywalls.
            </p>

            {/* Social row */}
            <div className="flex items-center gap-2 pt-1">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border border-white/8 bg-white/3 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/8 transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map((col) => (
            <div key={col.heading} className="space-y-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(({ label, href, icon: Icon, external }) => (
                  <li key={label}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group/link"
                      >
                        <Icon className="w-3.5 h-3.5 text-gray-600 group-hover/link:text-primary transition-colors shrink-0" />
                        {label}
                        <ArrowUpRight className="w-3 h-3 text-gray-700 group-hover/link:text-gray-400 transition-colors" />
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group/link"
                      >
                        <Icon className="w-3.5 h-3.5 text-gray-600 group-hover/link:text-primary transition-colors shrink-0" />
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick-jump pill bar */}
        <div className="mb-10 flex flex-wrap gap-2">
          {[
            { label: "All Roadmaps", href: "/roadmaps" },
            { label: "Dev Paths", href: "/paths" },
            { label: "Full-Stack Path", href: "/paths" },
            { label: "AI / ML Path", href: "/paths" },
            { label: "All Resources", href: "/resources" },
            { label: "What's New", href: "/changelog" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs px-3 py-1.5 rounded-full border border-white/8 bg-white/3 text-gray-500 hover:text-white hover:border-white/20 hover:bg-white/6 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p className="text-xs text-gray-600 flex items-center gap-1.5">
            <Heart className="w-3 h-3 text-primary/60 fill-primary/20 animate-pulse" />
            Made with love by 4ever Rooted developers ·{" "}
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </p>

          {/* Bottom right links */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link href="/about" className="hover:text-gray-400 transition-colors">
              About
            </Link>
            <span className="text-white/10">·</span>
            <a
              href="https://github.com/topics/developer-roadmap"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-gray-400 transition-colors"
            >
              <Github className="w-3 h-3" />
              Open Source
            </a>
            <span className="text-white/10">·</span>
            <Link href="/admin" className="flex items-center gap-1 hover:text-gray-400 transition-colors">
              <Shield className="w-3 h-3" />
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
