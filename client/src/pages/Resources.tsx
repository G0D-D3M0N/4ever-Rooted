import { useState, useEffect, useRef, forwardRef, Ref } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import BeginnersGuide from "@/components/BeginnersGuide";
import { useResources } from "@/hooks/use-resources";
import { useUser } from "@/hooks/use-user";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink, Search, AlertTriangle, ArrowUpRight,
  BookOpen, Wrench, Shield, Palette, Users, Bot, LibraryBig,
  Code2, GraduationCap, Layers, Menu, X, Plus, ChevronRight,
  Tag, Info, Brain, ThumbsUp, ChevronLeft, SlidersHorizontal,
  Tv, Cog,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Category / Subcategory Metadata ─────────────────────────────────────────

type SubcategoryMeta = { description: string };
type CategoryMeta = {
  color: string; bg: string; border: string; glow: string;
  Icon: React.ElementType;
  description: string;
  warning?: string;
  subcategories: Record<string, SubcategoryMeta>;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  "Learning": {
    color: "#a855f7", bg: "rgba(168,85,247,0.09)", border: "rgba(168,85,247,0.3)", glow: "rgba(168,85,247,0.15)",
    Icon: GraduationCap,
    description: "Courses, curricula, interactive platforms, and structured paths.",
    subcategories: {
      "Courses & Curricula":    { description: "Full learning programs and structured courses from beginner to advanced." },
      "CS Fundamentals":        { description: "Core computer science foundations, degree-equivalent paths." },
      "Interactive Platforms":  { description: "Learn by doing — write code inside lessons, play games, solve puzzles." },
      "Video & Lectures":       { description: "YouTube channels, recorded lectures, and video series." },
      "Guides & Roadmaps":      { description: "Curated paths showing exactly what to learn and in what order." },
    },
  },
  "Programming": {
    color: "#00f3ff", bg: "rgba(0,243,255,0.08)", border: "rgba(0,243,255,0.25)", glow: "rgba(0,243,255,0.12)",
    Icon: Code2,
    description: "Editors, IDEs, version control, databases, frameworks, and deployment.",
    subcategories: {
      "Editors & IDEs":              { description: "Code editors, full IDEs, and configuration resources." },
      "Online IDEs & Playgrounds":   { description: "Write and run code in the browser without any setup." },
      "Version Control":             { description: "Git, GitHub, and collaborative version control tools." },
      "Databases":                   { description: "Database tools, platforms, and learning resources." },
      "Frameworks & Ecosystems":     { description: "Language-specific frameworks, libraries, and ecosystem guides." },
      "Testing Tools":               { description: "Unit, integration, and end-to-end testing frameworks." },
      "Build & Deploy":              { description: "Build tools, deployment platforms, and static hosting." },
    },
  },
  "Dev Tools": {
    color: "#facc15", bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.25)", glow: "rgba(250,204,21,0.12)",
    Icon: Wrench,
    description: "Online toolkits, API tools, code sharing, data visualization, and utilities.",
    subcategories: {
      "Online Toolkits":           { description: "Multi-tool sites with converters, generators, and formatters." },
      "API Tools":                 { description: "Test, mock, and build APIs with these developer tools." },
      "Code Sharing & Snippets":   { description: "Create code images, share snippets, and collaborate on code." },
      "Data & Visualization":      { description: "Visualize JSON, databases, and data structures." },
      "Regex & Text Tools":        { description: "Regex editors, shell explainers, and text transformation tools." },
      "Performance & Debugging":   { description: "Measure, profile, and debug web apps for speed and compatibility." },
    },
  },
  "AI & ML": {
    color: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.25)", glow: "rgba(129,140,248,0.12)",
    Icon: Brain,
    description: "AI assistants, open-source models, LLM development, and machine learning resources.",
    subcategories: {
      "AI Assistants":     { description: "Conversational AI tools for coding help, research, and writing." },
      "Open-Source AI":    { description: "Run models locally, access open-source models and inference APIs." },
      "LLM Development":   { description: "Frameworks, tools, and guides for building with LLMs." },
      "ML Learning":       { description: "Courses, books, and resources for learning machine learning." },
    },
  },
  "Cybersecurity": {
    color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.25)", glow: "rgba(249,115,22,0.12)",
    Icon: Shield,
    description: "Web security, CTF platforms, wargames, and security references.",
    warning: "Many security resources involve practicing on intentionally vulnerable systems. Only test systems you have explicit permission to test. Never use these skills on production systems without authorization.",
    subcategories: {
      "Web Security Training":  { description: "Learn web application security through labs and guided courses." },
      "CTF Platforms":          { description: "Capture the Flag competitions and practice platforms." },
      "Wargames":               { description: "Classic wargame challenges for learning hacking fundamentals." },
      "Security References":    { description: "Tools, checklists, wordlists, and exploit databases." },
    },
  },
  "Design & UI": {
    color: "#ec4899", bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.25)", glow: "rgba(236,72,153,0.12)",
    Icon: Palette,
    description: "Design tools, icon libraries, color utilities, CSS tools, and fonts.",
    subcategories: {
      "Design Tools":         { description: "Full design and prototyping tools for UI/UX work." },
      "Icons & Assets":       { description: "Free icon libraries, SVG illustrations, and visual assets." },
      "Colors & Theming":     { description: "Palette generators, color pickers, and theming utilities." },
      "CSS Tools":            { description: "CSS generators, interactive learners, and animation libraries." },
      "Fonts & Typography":   { description: "Free font libraries, pairing tools, and web typography resources." },
    },
  },
  "Reference": {
    color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.25)", glow: "rgba(34,211,238,0.12)",
    Icon: BookOpen,
    description: "Documentation hubs, cheatsheets, language guides, and web standards.",
    subcategories: {
      "Documentation":      { description: "Multi-language documentation hubs and official references." },
      "Cheatsheets":        { description: "Quick-reference cards for tools, languages, and frameworks." },
      "Language Guides":    { description: "In-depth language-specific tutorials and reference material." },
      "Web Standards":      { description: "Browser compatibility, specifications, and web platform standards." },
    },
  },
  "Community": {
    color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)", glow: "rgba(52,211,153,0.12)",
    Icon: Users,
    description: "Developer forums, tech news, engineering blogs, and community hubs.",
    subcategories: {
      "Forums & Q&A":          { description: "Ask questions, help others, and discuss programming topics." },
      "Tech News & Feeds":     { description: "Stay current with dev news, releases, and industry trends." },
      "Engineering Blogs":     { description: "High-quality blog posts from engineers at major tech companies." },
    },
  },
  "Books": {
    color: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.25)", glow: "rgba(251,146,60,0.12)",
    Icon: LibraryBig,
    description: "Free programming books, systems texts, and math & CS theory.",
    subcategories: {
      "Programming Books":       { description: "Free online programming books across all languages." },
      "Systems & Architecture":  { description: "Operating systems, networks, distributed systems, and architecture." },
      "Math & CS Theory":        { description: "Free textbooks on discrete math, algorithms, and CS theory." },
    },
  },
  "Practice": {
    color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)", glow: "rgba(74,222,128,0.12)",
    Icon: Layers,
    description: "Algorithm challenges, interview prep, SQL practice, and coding puzzles.",
    subcategories: {
      "Algorithm Challenges":  { description: "Competitive programming and algorithm practice platforms." },
      "Interview Prep":        { description: "Study plans, guides, and mock interviews for tech jobs." },
      "SQL Practice":          { description: "Interactive SQL exercises and query practice." },
      "Puzzles & Fun":         { description: "Creative coding challenges and gamified learning." },
    },
  },
  "Entertainment": {
    color: "#e879f9", bg: "rgba(232,121,249,0.08)", border: "rgba(232,121,249,0.25)", glow: "rgba(232,121,249,0.12)",
    Icon: Tv,
    description: "Free movies, anime, music, gaming, and video tools from the FMHY index.",
    subcategories: {
      "Movies & TV":   { description: "Free streaming sites for movies and TV shows." },
      "Anime":         { description: "Free anime streaming and download platforms." },
      "Music":         { description: "Free music streaming, discovery, and download tools." },
      "Gaming":        { description: "Free game platforms, ROMs, emulators, and gaming tools." },
      "Video Tools":   { description: "Video editing, downloading, and conversion tools." },
    },
  },
  "General Tools": {
    color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.25)", glow: "rgba(56,189,248,0.12)",
    Icon: Cog,
    description: "File tools, download managers, converters, cloud storage, VPNs, and more.",
    subcategories: {
      "File Tools":              { description: "File conversion, compression, and management utilities." },
      "Download Tools":          { description: "Download managers, scrapers, and batch download tools." },
      "Converters & Utilities":  { description: "Online converters, formatters, and general-purpose tools." },
      "Storage & Cloud":         { description: "Free cloud storage, file hosting, and sync tools." },
      "VPN & Privacy":           { description: "VPN services, ad blockers, and privacy tools." },
      "Mobile Apps":             { description: "Useful Android and iOS apps available for free." },
    },
  },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_META);
const DEFAULT_META: CategoryMeta = {
  color: "#00f3ff", bg: "rgba(0,243,255,0.08)", border: "rgba(0,243,255,0.2)", glow: "rgba(0,243,255,0.1)",
  Icon: Layers, description: "", subcategories: {},
};

// ── Mirror-link safety warning (shown on all categories) ────────────────────
const MIRROR_WARNING = "Some of these sites have unofficial mirror links or typosquatting lookalikes. Always verify you're on the exact URL shown on each card before entering any credentials or downloading files.";

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return ""; }
}

// ── Vote Button ───────────────────────────────────────────────────────────────
function VoteButton({ resource, user }: { resource: any; user: any }) {
  const qc = useQueryClient();
  const [optimisticVoted, setOptimisticVoted] = useState<boolean | null>(null);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);

  const votes = optimisticCount ?? resource.votes ?? 0;
  const voted = optimisticVoted ?? false;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/resources/${resource.id}/vote`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ voted: boolean; votes: number }>;
    },
    onMutate: () => {
      const wasVoted = optimisticVoted ?? false;
      setOptimisticVoted(!wasVoted);
      setOptimisticCount((optimisticCount ?? resource.votes ?? 0) + (!wasVoted ? 1 : -1));
    },
    onSuccess: (data) => {
      setOptimisticVoted(data.voted);
      setOptimisticCount(data.votes);
      qc.invalidateQueries({ queryKey: ["/api/resources"] });
    },
    onError: () => {
      setOptimisticVoted(null);
      setOptimisticCount(null);
    },
  });

  if (!user) return null;

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); mutation.mutate(); }}
      disabled={mutation.isPending}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all",
        voted
          ? "text-primary bg-primary/10 border-primary/30"
          : "text-gray-500 bg-white/4 border-white/8 hover:text-primary hover:border-primary/25 hover:bg-primary/6"
      )}
    >
      <ThumbsUp className={cn("w-3 h-3 transition-transform", mutation.isPending && "animate-bounce")} />
      {votes > 0 && <span>{votes}</span>}
    </button>
  );
}

// ── Resource Card ────────────────────────────────────────────────────────────
const ResourceCard = forwardRef(function ResourceCard(
  { resource, user }: { resource: any; user?: any },
  ref: Ref<HTMLAnchorElement>
) {
  const meta = CATEGORY_META[resource.category] ?? DEFAULT_META;
  const domain = getDomain(resource.url);
  const tags: string[] = Array.isArray(resource.tags)
    ? resource.tags
    : (typeof resource.tags === "string" ? JSON.parse(resource.tags || "[]") : []);
  const warning: string | null = resource.warning ?? null;

  return (
    <motion.a
      ref={ref}
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -3 }}
      className="group flex flex-col h-full rounded-xl overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", transition: "border-color 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = meta.border;
        el.style.boxShadow = `0 6px 32px ${meta.glow}`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(255,255,255,0.06)";
        el.style.boxShadow = "none";
      }}
    >
      <div className="h-[2px] w-full shrink-0" style={{ background: `linear-gradient(90deg, ${meta.color}, transparent)` }} />

      <div className="flex flex-col flex-1 p-4">
        {/* Top: title + arrow */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-bold text-white line-clamp-1 transition-colors duration-150 group-hover:text-[var(--cat-color)]"
              style={{ "--cat-color": meta.color } as React.CSSProperties}
            >
              {resource.title}
            </h3>
            {domain && <p className="text-[10px] text-gray-600 font-mono mt-0.5">{domain}</p>}
          </div>
          <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center border border-white/10 bg-white/5 group-hover:border-white/20 transition-all mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Warning badge */}
        {warning && (
          <div className="flex items-start gap-1.5 mb-2 px-2 py-1.5 rounded-lg bg-amber-500/8 border border-amber-500/15">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-300/75 leading-snug">{warning}</p>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 flex-grow mb-3">{resource.description}</p>

        {/* Tags + Vote */}
        <div className="flex items-end justify-between gap-2 mt-auto">
          <div className="flex flex-wrap gap-1 flex-1">
            {tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded transition-all duration-150 cursor-default"
                style={{ color: "rgb(107 114 128)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = meta.color;
                  el.style.background = meta.bg;
                  el.style.borderColor = meta.border;
                  el.style.boxShadow = `0 0 8px ${meta.glow}`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = "rgb(107 114 128)";
                  el.style.background = "rgba(255,255,255,0.04)";
                  el.style.borderColor = "rgba(255,255,255,0.05)";
                  el.style.boxShadow = "none";
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <VoteButton resource={resource} user={user} />
        </div>

        {/* Submitter credit */}
        {resource.submittedBy && (
          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
              <span className="text-[6px] font-bold text-gray-400">✦</span>
            </div>
            <span className="text-[9px] text-gray-600">Community submission</span>
          </div>
        )}
      </div>
    </motion.a>
  );
});

// ── Submit Modal ─────────────────────────────────────────────────────────────
function SubmitModal({ onClose, user }: { onClose: () => void; user: any }) {
  const [form, setForm] = useState({ title: "", url: "", category: "Learning", subcategory: "", description: "", tags: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const subcats = CATEGORY_META[form.category]?.subcategories ?? {};

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setErrMsg("Sign in to submit resources."); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.errors?.[0]?.message || errData.message || "Something went wrong.";
        throw new Error(msg);
      }
      setStatus("success");
    } catch (err: any) { setErrMsg(err.message || "Something went wrong."); setStatus("error"); }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="w-full max-w-lg rounded-2xl p-6"
        style={{ background: "#161616", border: "1px solid rgba(0,243,255,0.15)", boxShadow: "0 0 80px rgba(0,243,255,0.06)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Submit a Resource</h2>
            <p className="text-xs text-gray-500 mt-0.5">Free resources only — no paywalled, spam, or low-quality links.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Not logged in — show login prompt instead of form */}
        {!user ? (
          <div className="text-center py-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border"
              style={{ background: "rgba(0,243,255,0.08)", borderColor: "rgba(0,243,255,0.2)" }}
            >
              <Plus className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-white font-semibold mb-2">Sign in to contribute</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              You need to be logged in to submit resources.<br />
              Your contribution will be reviewed by an admin before going live.
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                style={{ background: "rgba(0,243,255,0.1)", borderColor: "rgba(0,243,255,0.3)", color: "#00f3ff" }}
              >
                Login / Register
              </a>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : status === "success" ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <ChevronRight className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Resource submitted!</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your submission is pending admin review.<br />
              Once approved, it will appear in the library. Thanks for contributing!
            </p>
            <button onClick={onClose} className="mt-5 px-6 py-2 rounded-full text-sm font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Title *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. The Odin Project" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">URL *</label>
              <input required type="url" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: "" }))} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors">
                  {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Subcategory</label>
                <select value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors">
                  <option value="">— select —</option>
                  {Object.keys(subcats).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="free, JavaScript, beginner" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Description *</label>
              <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Briefly describe the resource and who it's useful for..." className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors resize-none" />
            </div>
            {status === "error" && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{errMsg}</p>}
            <button type="submit" disabled={status === "loading" || !user} className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, rgba(0,243,255,0.12), rgba(168,85,247,0.12))", border: "1px solid rgba(0,243,255,0.25)", color: "#00f3ff" }}>
              {status === "loading" ? "Submitting..." : "Submit Resource"}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  activeCategory, setActiveCategory, search, setSearch, resourceCounts, showSubmit, setShowSubmit,
}: {
  activeCategory: string; setActiveCategory: (c: string) => void;
  search: string; setSearch: (s: string) => void;
  resourceCounts: Record<string, number>;
  showSubmit: boolean; setShowSubmit: (v: boolean) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function toggleExpand(cat: string, e: React.MouseEvent) {
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Submit button — TOP, prominent ── */}
      <button
        onClick={() => setShowSubmit(true)}
        className="flex items-center justify-center gap-2 w-full py-2.5 mb-4 rounded-xl text-sm font-bold transition-all border relative overflow-hidden group"
        style={{
          background: "linear-gradient(135deg, rgba(0,243,255,0.12), rgba(168,85,247,0.10))",
          borderColor: "rgba(0,243,255,0.3)",
          color: "#00f3ff",
          boxShadow: "0 0 20px rgba(0,243,255,0.08)",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px rgba(0,243,255,0.18)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,243,255,0.08)"; }}
      >
        <Plus className="w-4 h-4" />
        Submit a Resource
      </button>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
        <input
          type="text" placeholder="Search resources..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary/40 transition-colors"
        />
      </div>

      {/* Beginner's Guide */}
      <button
        onClick={() => setActiveCategory("Beginners Guide")}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all mb-1",
          activeCategory === "Beginners Guide"
            ? "bg-primary/10 border border-primary/25 text-primary"
            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
        )}
      >
        <span className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5" />
          Beginner's Guide
        </span>
      </button>

      {/* All Resources */}
      <button
        onClick={() => setActiveCategory("All")}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all mb-1",
          activeCategory === "All"
            ? "bg-primary/10 border border-primary/25 text-primary"
            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
        )}
      >
        <span className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5" />
          All Resources
        </span>
        <span className="text-[10px] font-mono opacity-50">{Object.values(resourceCounts).reduce((a, b) => a + b, 0)}</span>
      </button>

      {/* Divider */}
      <div className="border-t border-white/5 my-2" />

      {/* Category list */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1" style={{ scrollbarWidth: "none" }}>
        {ALL_CATEGORIES.map(cat => {
          const meta = CATEGORY_META[cat];
          const { Icon } = meta;
          const isActive = activeCategory === cat;
          const isExp = expanded[cat] ?? isActive;
          const count = resourceCounts[cat] ?? 0;

          return (
            <div key={cat}>
              <button
                onClick={() => { setActiveCategory(cat); setExpanded(prev => ({ ...prev, [cat]: true })); }}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-all group",
                  isActive
                    ? "border"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}
                style={isActive ? { background: meta.bg, borderColor: meta.border, color: meta.color } : {}}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {cat}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono opacity-50">{count}</span>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={e => toggleExpand(cat, e)}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && toggleExpand(cat, e as any)}
                    className="w-4 h-4 rounded flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <ChevronRight className={cn("w-2.5 h-2.5 transition-transform", isExp ? "rotate-90" : "")} />
                  </div>
                </div>
              </button>

              {/* Subcategory links */}
              <AnimatePresence>
                {isExp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-6 pb-1 space-y-0.5">
                      {Object.keys(meta.subcategories).map(sub => (
                        <a
                          key={sub}
                          href={`#${encodeURIComponent(sub)}`}
                          onClick={e => { e.preventDefault(); setActiveCategory(cat); document.getElementById(encodeURIComponent(sub))?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                          className="block text-[11px] text-gray-500 hover:text-gray-300 px-2 py-1 rounded-lg hover:bg-white/5 transition-all truncate"
                        >
                          {sub}
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ── Subcategory Section ──────────────────────────────────────────────────────
function SubcategorySection({ subcategory, resources, meta, user }: {
  subcategory: string; resources: any[]; meta: CategoryMeta; user?: any;
}) {
  const subMeta = meta.subcategories[subcategory] ?? { description: "" };
  if (resources.length === 0) return null;

  return (
    <div id={encodeURIComponent(subcategory)} className="scroll-mt-24 mb-10">
      {/* Subcategory header */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
        style={{
          background: `linear-gradient(105deg, ${meta.bg} 0%, transparent 80%)`,
          border: `1px solid ${meta.border}`,
          boxShadow: `0 0 20px ${meta.glow}`,
        }}
      >
        {/* Glowing color accent bar */}
        <div
          className="w-[3px] self-stretch rounded-full shrink-0"
          style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
        />

        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-extrabold tracking-wide uppercase"
            style={{
              color: meta.color,
              textShadow: `0 0 18px ${meta.color}80, 0 0 6px ${meta.color}40`,
              letterSpacing: "0.07em",
            }}
          >
            {subcategory}
          </h3>
          {subMeta.description && (
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{subMeta.description}</p>
          )}
        </div>

        {/* Count pill */}
        <span
          className="shrink-0 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full"
          style={{
            color: meta.color,
            background: meta.bg,
            border: `1px solid ${meta.border}`,
          }}
        >
          {resources.length}
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-8">
        <AnimatePresence mode="popLayout">
          {resources.map(r => <ResourceCard key={r.id} resource={r} user={user} />)}
        </AnimatePresence>
      </div>
    </div>
  );
}

const PAGE_SIZE = 30;

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Resources() {
  const [activeCategory, setActiveCategory] = useState("Beginners Guide");
  const [search, setSearch] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { user } = useUser();

  useEffect(() => {
    document.title = "Resources — 4ever Rooted";
    return () => { document.title = "4ever Rooted — Developer Learning Platform"; };
  }, []);

  // Reset page when category or search changes
  useEffect(() => { setPage(1); }, [activeCategory, search]);

  const { data: allResources = [], isLoading } = useResources(undefined, search || undefined);

  // Filter by active category
  const filtered = activeCategory === "All"
    ? allResources
    : allResources.filter((r: any) => r.category === activeCategory);

  // Resource counts per category
  const resourceCounts = ALL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = allResources.filter((r: any) => r.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  // Group by subcategory (for the active category)
  const bySubcategory = filtered.reduce((acc: Record<string, any[]>, r: any) => {
    const sub = r.subcategory || "General";
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(r);
    return acc;
  }, {});

  // Ordered subcategories from metadata
  const activeMeta = activeCategory !== "All" ? (CATEGORY_META[activeCategory] ?? DEFAULT_META) : null;
  const orderedSubs = activeMeta
    ? Object.keys(activeMeta.subcategories).filter(s => bySubcategory[s]?.length)
    : Object.keys(bySubcategory);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-16">
        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:flex sticky top-16 h-[calc(100vh-4rem)] w-64 flex-shrink-0 flex-col border-r border-white/5 bg-[#0a0a0a]">
          <div className="h-full overflow-hidden flex flex-col p-4">
            {/* Sidebar header */}
            <div className="flex items-center gap-2 mb-4 pt-2">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Dev Resources</span>
            </div>
            <Sidebar
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              search={search}
              setSearch={setSearch}
              resourceCounts={resourceCounts}
              showSubmit={showSubmit}
              setShowSubmit={setShowSubmit}
            />
          </div>
        </aside>

        {/* ── Mobile Sidebar Overlay ── */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              {/* backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/70 md:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
              {/* drawer */}
              <motion.div
                key="drawer"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#0a0a0a] border-r border-white/10 flex flex-col md:hidden"
              >
                <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Dev Resources</span>
                  </div>
                  <button onClick={() => setMobileSidebarOpen(false)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden p-4">
                  <Sidebar
                    activeCategory={activeCategory}
                    setActiveCategory={c => { setActiveCategory(c); setMobileSidebarOpen(false); }}
                    search={search}
                    setSearch={setSearch}
                    resourceCounts={resourceCounts}
                    showSubmit={showSubmit}
                    setShowSubmit={v => { setShowSubmit(v); setMobileSidebarOpen(false); }}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8 lg:py-10 max-w-none">

          {/* Page header */}
          <div className="mb-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                {/* Mobile filter button */}
                <button
                  className="md:hidden mt-1 shrink-0 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                </button>
                <div>
                  {activeCategory === "Beginners Guide" ? null : activeCategory === "All" ? (
                    <>
                      <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                        All <span className="text-primary" style={{ textShadow: "0 0 24px rgba(0,243,255,0.4)" }}>Resources</span>
                      </h1>
                      <p className="text-gray-500 text-sm">Every free developer resource, organized by category.</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        {activeMeta && <activeMeta.Icon className="w-5 h-5" style={{ color: activeMeta.color }} />}
                        <h1 className="text-3xl font-black tracking-tight text-white">{activeCategory}</h1>
                      </div>
                      <p className="text-gray-500 text-sm">{activeMeta?.description}</p>
                    </>
                  )}
                </div>
              </div>
              {!isLoading && activeCategory !== "Beginners Guide" && (
                <span className="text-xs font-mono text-gray-600 mt-1 shrink-0">
                  {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
                  {search ? ` for "${search}"` : ""}
                </span>
              )}
            </motion.div>
          </div>

          {/* Mirror-link safety banner */}
          {activeCategory !== "Beginners Guide" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl mb-6 border"
              style={{ background: "rgba(0,243,255,0.04)", borderColor: "rgba(0,243,255,0.1)" }}
            >
              <Info className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="text-primary/80 font-semibold">Stay safe:</span> {MIRROR_WARNING}
              </p>
            </motion.div>
          )}

          {/* Category-specific warning (e.g. cybersecurity disclaimer) */}
          <AnimatePresence>
            {activeCategory !== "Beginners Guide" && activeMeta?.warning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 p-3 rounded-xl mb-6 border border-amber-500/20 bg-amber-500/5"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/80 leading-relaxed">{activeMeta.warning}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Beginner's Guide view */}
          {activeCategory === "Beginners Guide" ? (
            <BeginnersGuide />
          ) : isLoading ? (
            <div className="space-y-10">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <div className="h-5 w-40 bg-white/5 rounded animate-pulse mb-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="h-44 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="text-gray-500">No resources found.</p>
              <button onClick={() => { setSearch(""); setActiveCategory("All"); }} className="mt-3 text-xs text-primary/60 hover:text-primary transition-colors">
                Clear filters
              </button>
            </motion.div>
          ) : activeCategory === "All" ? (
            // All view: group by category then subcategory
            <div className="space-y-12">
              {ALL_CATEGORIES.filter(cat => allResources.some((r: any) => r.category === cat && (!search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())))).map(cat => {
                const catMeta = CATEGORY_META[cat];
                const catResources = allResources.filter((r: any) => r.category === cat && (!search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())));
                const subGroups = catResources.reduce((acc: Record<string, any[]>, r: any) => {
                  const sub = r.subcategory || "General";
                  if (!acc[sub]) acc[sub] = [];
                  acc[sub].push(r);
                  return acc;
                }, {});

                return (
                  <section key={cat}>
                    {/* Category heading */}
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b" style={{ borderColor: `${catMeta.color}20` }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: catMeta.bg, border: `1px solid ${catMeta.border}` }}>
                        <catMeta.Icon className="w-4 h-4" style={{ color: catMeta.color }} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">{cat}</h2>
                        <p className="text-xs text-gray-500">{catResources.length} resources</p>
                      </div>
                      <button
                        onClick={() => setActiveCategory(cat)}
                        className="ml-auto text-xs font-medium transition-colors hover:opacity-80 flex items-center gap-1"
                        style={{ color: catMeta.color }}
                      >
                        View all <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subcategory sections */}
                    {Object.keys(catMeta.subcategories).filter(s => subGroups[s]?.length).map(sub => (
                      <SubcategorySection key={sub} subcategory={sub} resources={subGroups[sub]} meta={catMeta} user={user} />
                    ))}
                  </section>
                );
              })}
            </div>
          ) : (
            // Single category view with pagination
            (() => {
              const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
              const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
              const pageBySubcategory = paginated.reduce((acc: Record<string, any[]>, r: any) => {
                const sub = r.subcategory || "General";
                if (!acc[sub]) acc[sub] = [];
                acc[sub].push(r);
                return acc;
              }, {});
              const pageOrderedSubs = activeMeta
                ? Object.keys(activeMeta.subcategories).filter(s => pageBySubcategory[s]?.length)
                : Object.keys(pageBySubcategory);

              return (
                <div>
                  {pageOrderedSubs.map(sub => (
                    <SubcategorySection key={sub} subcategory={sub} resources={pageBySubcategory[sub] || []} meta={activeMeta!} user={user} />
                  ))}

                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 mt-8 mb-4"
                    >
                      <button
                        onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={page === 1}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className={cn(
                              "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                              p === page
                                ? "text-primary bg-primary/10 border border-primary/30"
                                : "text-gray-500 hover:text-white hover:bg-white/8 border border-transparent"
                            )}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={page === totalPages}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}

                  {totalPages > 1 && (
                    <p className="text-center text-[10px] font-mono text-gray-700 mb-4">
                      Page {page} of {totalPages} · {filtered.length} total
                    </p>
                  )}
                </div>
              );
            })()
          )}

          {/* ── Contribute CTA banner ── */}
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-14 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 border"
              style={{
                background: "linear-gradient(135deg, rgba(0,243,255,0.05), rgba(168,85,247,0.05))",
                borderColor: "rgba(0,243,255,0.15)",
                boxShadow: "0 0 40px rgba(0,243,255,0.04)",
              }}
            >
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-base font-bold text-white mb-1">Know a great free resource?</h3>
                <p className="text-sm text-gray-500">
                  Share it with the community. Submissions go through admin review before being listed.
                </p>
              </div>
              <button
                onClick={() => setShowSubmit(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(0,243,255,0.12), rgba(168,85,247,0.10))",
                  borderColor: "rgba(0,243,255,0.3)",
                  color: "#00f3ff",
                  boxShadow: "0 0 20px rgba(0,243,255,0.08)",
                }}
              >
                <Plus className="w-4 h-4" />
                Submit a Resource
              </button>
            </motion.div>
          )}
        </main>
      </div>

      <Footer />

      {/* Floating mobile filter button — always visible while scrolling */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed bottom-6 right-5 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-bold transition-all"
        style={{
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(0,243,255,0.35)",
          color: "#00f3ff",
          boxShadow: "0 4px 24px rgba(0,243,255,0.15), 0 0 0 1px rgba(0,243,255,0.1)",
        }}
        aria-label="Open filters"
      >
        <SlidersHorizontal className="w-4 h-4" />
        {activeCategory !== "All" ? activeCategory : "Filter"}
      </motion.button>

      {/* Submit modal */}
      <AnimatePresence>
        {showSubmit && <SubmitModal onClose={() => setShowSubmit(false)} user={user} />}
      </AnimatePresence>
    </div>
  );
}
