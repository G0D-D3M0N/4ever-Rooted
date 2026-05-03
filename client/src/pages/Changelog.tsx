import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Loader2, Map, BookOpen, Sparkles, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

export default function Changelog() {
  useEffect(() => {
    document.title = "Changelog — 4ever Rooted";
    return () => { document.title = "4ever Rooted — Developer Learning Platform"; };
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["changelog"],
    queryFn: async () => {
      const res = await fetch("/api/changelog");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const resources: any[] = data?.resources ?? [];
  const roadmaps: any[] = data?.roadmaps ?? [];

  function timeAgo(ts: any) {
    if (!ts) return "";
    const d = new Date(typeof ts === "number" ? ts * 1000 : ts);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <div className="h-16 shrink-0" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">What's New</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            Recent <span className="text-primary" style={{ textShadow: "0 0 24px rgba(0,243,255,0.4)" }}>Additions</span>
          </h1>
          <p className="text-gray-500 text-sm">
            The latest roadmaps and resources added to the platform.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* New Roadmaps */}
            {roadmaps.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#bc13fe]/20">
                  <div className="w-7 h-7 rounded-lg bg-[#bc13fe]/10 border border-[#bc13fe]/20 flex items-center justify-center">
                    <Map className="w-3.5 h-3.5 text-[#bc13fe]" />
                  </div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-widest">New Roadmaps</h2>
                </div>
                <div className="space-y-2">
                  {roadmaps.map((rm: any, i: number) => (
                    <motion.div
                      key={rm.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + i * 0.04 }}
                    >
                      <Link href={`/roadmaps/${rm.id}`}>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8 bg-[#141414] hover:border-[#bc13fe]/30 hover:bg-[#bc13fe]/5 transition-all cursor-pointer group">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white group-hover:text-[#bc13fe] transition-colors truncate">{rm.title}</span>
                              <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-[#bc13fe]/10 border border-[#bc13fe]/20 text-[#bc13fe] shrink-0">{rm.category}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">{rm.description}</p>
                          </div>
                          <span className="hidden sm:inline text-[10px] text-gray-600 font-mono shrink-0">{timeAgo(rm.createdAt)}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#bc13fe] transition-colors shrink-0" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* New Resources */}
            {resources.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/20">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-widest">New Resources</h2>
                </div>
                <div className="space-y-2">
                  {resources.map((r: any, i: number) => {
                    let domain = "";
                    try { domain = new URL(r.url).hostname.replace("www.", ""); } catch {}
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.11 + i * 0.03 }}
                      >
                        <a href={r.url} target="_blank" rel="noopener noreferrer">
                          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8 bg-[#141414] hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">{r.title}</span>
                                <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-gray-500 shrink-0">{r.category}</span>
                              </div>
                              <p className="text-[11px] text-gray-600 font-mono mt-0.5">{domain}</p>
                            </div>
                            <span className="hidden sm:inline text-[10px] text-gray-600 font-mono shrink-0">{timeAgo(r.createdAt)}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-primary transition-colors shrink-0" />
                          </div>
                        </a>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
