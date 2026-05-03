import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useRoadmaps } from "@/hooks/use-roadmaps";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Shield, Layers, Globe, Database, Terminal,
  Code2, Cpu, Server, Cloud, Zap, Star,
  Search, Map, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const IconMap: Record<string, any> = {
  brain: Brain,
  shield: Shield,
  layers: Layers,
  globe: Globe,
  database: Database,
  terminal: Terminal,
  code: Code2,
  cpu: Cpu,
  server: Server,
  cloud: Cloud,
  zap: Zap,
  star: Star,
};

function RoadmapSidebar({
  categories,
  activeCategory,
  setActiveCategory,
  search,
  setSearch,
  counts,
}: {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  search: string;
  setSearch: (s: string) => void;
  counts: Record<string, number>;
}) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search roadmaps..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#bc13fe]/40 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* All */}
      <button
        onClick={() => setActiveCategory("All")}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all mb-1",
          activeCategory === "All"
            ? "bg-[#bc13fe]/10 border border-[#bc13fe]/25 text-[#bc13fe]"
            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
        )}
      >
        <span className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5" />
          All Roadmaps
        </span>
        <span className="text-[10px] font-mono opacity-50">{total}</span>
      </button>

      <div className="border-t border-white/5 my-2" />

      {/* Category list */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1" style={{ scrollbarWidth: "none" }}>
        {categories.map(cat => {
          const isActive = activeCategory === cat;
          const count = counts[cat] ?? 0;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-all",
                isActive
                  ? "bg-[#bc13fe]/10 border border-[#bc13fe]/25 text-[#bc13fe]"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <span className="flex items-center gap-2">
                <Map className="w-3.5 h-3.5 shrink-0" />
                {cat}
              </span>
              <span className="text-[10px] font-mono opacity-50">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Roadmaps() {
  const { data: roadmaps = [], isLoading } = useRoadmaps();

  useEffect(() => {
    document.title = "Roadmaps — 4ever Rooted";
    return () => { document.title = "4ever Rooted — Developer Learning Platform"; };
  }, []);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = Array.from(
    new Set((roadmaps as any[]).map((r: any) => r.category).filter(Boolean))
  ).sort() as string[];

  const counts = categories.reduce((acc, cat) => {
    acc[cat] = (roadmaps as any[]).filter((r: any) => r.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const filtered = (roadmaps as any[]).filter((r: any) => {
    const matchCat = activeCategory === "All" || r.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      r.title.toLowerCase().includes(q) ||
      (r.description || "").toLowerCase().includes(q) ||
      (r.category || "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-16">
        {/* ── Sidebar ── */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-60 flex-shrink-0 border-r border-white/5 bg-[#0a0a0a] hidden md:flex flex-col">
          <div className="h-full overflow-hidden flex flex-col p-4">
            <div className="flex items-center gap-2 mb-4 pt-2">
              <Map className="w-4 h-4 text-[#bc13fe]" />
              <span className="text-xs font-bold text-[#bc13fe] uppercase tracking-widest">Roadmaps</span>
            </div>
            <RoadmapSidebar
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              search={search}
              setSearch={setSearch}
              counts={counts}
            />
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

          {/* Mobile search */}
          <div className="md:hidden mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search roadmaps..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#bc13fe]/40 transition-colors"
              />
            </div>
            {/* Mobile category chips */}
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pt-3 pb-1" style={{ scrollbarWidth: "none" }}>
                <button
                  onClick={() => setActiveCategory("All")}
                  className={cn(
                    "shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all",
                    activeCategory === "All"
                      ? "bg-[#bc13fe]/15 border-[#bc13fe]/30 text-[#bc13fe]"
                      : "border-white/10 text-gray-400 hover:text-white"
                  )}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all",
                      activeCategory === cat
                        ? "bg-[#bc13fe]/15 border-[#bc13fe]/30 text-[#bc13fe]"
                        : "border-white/10 text-gray-400 hover:text-white"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Header */}
          <div className="mb-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                {activeCategory === "All" ? (
                  <>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                      All <span className="text-[#bc13fe]" style={{ textShadow: "0 0 24px rgba(188,19,254,0.4)" }}>Roadmaps</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Structured learning paths from beginner to expert.</p>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-1">{activeCategory}</h1>
                    <p className="text-gray-500 text-sm">{filtered.length} roadmap{filtered.length !== 1 ? "s" : ""} in this category.</p>
                  </>
                )}
              </div>
              {!isLoading && (
                <span className="text-xs font-mono text-gray-600 mb-1 shrink-0">
                  {filtered.length} roadmap{filtered.length !== 1 ? "s" : ""}
                  {search ? ` for "${search}"` : ""}
                </span>
              )}
            </motion.div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-56 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <p className="text-gray-500 mb-3">No roadmaps found.</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("All"); }}
                className="text-xs text-[#bc13fe]/60 hover:text-[#bc13fe] transition-colors"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((roadmap: any, index: number) => {
                  const Icon = roadmap.icon ? IconMap[roadmap.icon] || Terminal : Terminal;
                  return (
                    <Link key={roadmap.id} href={`/roadmaps/${roadmap.id}`}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.04 }}
                        whileHover={{ y: -5 }}
                        className="group relative h-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-7 hover:border-[#bc13fe]/30 hover:shadow-[0_0_25px_rgba(188,19,254,0.15)] transition-all duration-300 cursor-pointer overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#bc13fe]/5 rounded-full blur-[50px] group-hover:bg-[#bc13fe]/10 transition-colors" />
                        <div className="relative z-10">
                          <div className="w-12 h-12 rounded-xl bg-[#bc13fe]/10 flex items-center justify-center mb-5 group-hover:bg-[#bc13fe] group-hover:text-black transition-all duration-300">
                            <Icon className="w-6 h-6 text-[#bc13fe] group-hover:text-black" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#bc13fe] transition-colors line-clamp-2">
                            {roadmap.title}
                          </h3>
                          <p className="text-gray-400 text-xs leading-relaxed mb-5 line-clamp-3">
                            {roadmap.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 group-hover:text-white transition-colors">
                            <span className="px-2.5 py-1 rounded-full border border-white/10 bg-black/20 text-[10px] uppercase tracking-wider">
                              {roadmap.category}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
