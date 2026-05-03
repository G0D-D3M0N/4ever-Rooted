import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Map, BookOpen, ArrowUpRight, X, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchPage() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialQ = params.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<{ resources: any[]; roadmaps: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ resourceCount: number; roadmapCount: number } | null>(null);
  const debouncedQ = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Search — 4ever Rooted";
    return () => { document.title = "4ever Rooted — Developer Learning Platform"; };
  }, []);

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debouncedQ.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQ)}`)
      .then(r => r.json())
      .then(data => { setResults(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [debouncedQ]);

  const total = results ? results.resources.length + results.roadmaps.length : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <div className="h-16 shrink-0" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Search input */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search roadmaps and resources..."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:border-primary/40 transition-colors"
              style={{ boxShadow: query ? "0 0 0 1px rgba(0,243,255,0.15), 0 0 30px rgba(0,243,255,0.06)" : "none" }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Hint */}
          {!query && (
            <p className="text-center text-gray-600 text-sm mt-4">
              {stats
                ? `Search across ${stats.resourceCount}+ resources and ${stats.roadmapCount}+ roadmaps.`
                : "Search across all resources and roadmaps."}
            </p>
          )}
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {/* No results */}
        {!loading && results && total === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No results for <span className="text-white font-medium">"{debouncedQ}"</span></p>
            <p className="text-gray-600 text-sm mt-1">Try a different keyword or browse by category.</p>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {!loading && results && total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Summary */}
              <p className="text-xs text-gray-600 font-mono">
                {total} result{total !== 1 ? "s" : ""} for <span className="text-gray-400">"{debouncedQ}"</span>
              </p>

              {/* Roadmaps */}
              {results.roadmaps.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Map className="w-4 h-4 text-[#bc13fe]" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">Roadmaps</h2>
                    <span className="text-[10px] font-mono text-gray-600 ml-auto">{results.roadmaps.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.roadmaps.map((rm: any, i: number) => (
                      <motion.div
                        key={rm.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link href={`/roadmaps/${rm.id}`}>
                          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8 bg-[#141414] hover:border-[#bc13fe]/30 hover:bg-[#bc13fe]/5 transition-all cursor-pointer group">
                            <div className="w-8 h-8 rounded-lg bg-[#bc13fe]/10 border border-[#bc13fe]/20 flex items-center justify-center shrink-0">
                              <Map className="w-4 h-4 text-[#bc13fe]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white group-hover:text-[#bc13fe] transition-colors truncate">{rm.title}</p>
                              <p className="text-[11px] text-gray-500 truncate">{rm.description}</p>
                            </div>
                            <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-[#bc13fe]/10 border border-[#bc13fe]/20 text-[#bc13fe] shrink-0">{rm.category}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#bc13fe] transition-colors shrink-0" />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Resources */}
              {results.resources.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">Resources</h2>
                    <span className="text-[10px] font-mono text-gray-600 ml-auto">{results.resources.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.resources.map((r: any, i: number) => {
                      let domain = "";
                      try { domain = new URL(r.url).hostname.replace("www.", ""); } catch {}
                      return (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <a href={r.url} target="_blank" rel="noopener noreferrer">
                            <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/8 bg-[#141414] hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <BookOpen className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">{r.title}</p>
                                <p className="text-[11px] text-gray-500 truncate">{domain} · {r.category}</p>
                              </div>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-primary transition-colors shrink-0" />
                            </div>
                          </a>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
