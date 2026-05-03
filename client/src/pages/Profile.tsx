import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  User, BookOpen, Map, Clock, CheckCircle2, Loader2,
  ExternalLink, ArrowUpRight, TrendingUp, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function Profile() {
  const { user, isLoading: userLoading, signOut } = useUser();
  const [, navigate] = useLocation();

  useEffect(() => {
    document.title = "My Profile — 4ever Rooted";
    return () => { document.title = "4ever Rooted — Developer Learning Platform"; };
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!user,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Sign in to view your profile</h1>
            <button
              onClick={() => navigate("/auth")}
              className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={{ background: "rgba(0,243,255,0.1)", borderColor: "rgba(0,243,255,0.3)", color: "#00f3ff" }}
            >
              Sign in
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const submitted = profile?.submitted ?? [];
  const roadmapProgress = profile?.roadmapProgress ?? [];
  const approvedCount = submitted.filter((r: any) => r.status === "approved").length;
  const pendingCount = submitted.filter((r: any) => r.status === "pending").length;
  const activeRoadmaps = roadmapProgress.filter((rp: any) => rp.pct > 0 && rp.pct < 100);
  const completedRoadmaps = roadmapProgress.filter((rp: any) => rp.pct === 100);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <div className="h-16 shrink-0" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center border text-2xl font-black text-primary"
            style={{ background: "rgba(0,243,255,0.08)", borderColor: "rgba(0,243,255,0.25)" }}
          >
            {(user.username || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">@{user.username}</h1>
            <p className="text-gray-500 text-sm mt-0.5">Member of 4ever Rooted</p>
          </div>
          <button
            onClick={() => { signOut(); navigate("/"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/8 border border-white/10 hover:border-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {[
                { label: "Resources Submitted", value: submitted.length, color: "#00f3ff" },
                { label: "Approved", value: approvedCount, color: "#4ade80" },
                { label: "Pending Review", value: pendingCount, color: "#facc15" },
                { label: "Roadmaps Started", value: roadmapProgress.length, color: "#bc13fe" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/8 bg-[#141414] p-4"
                >
                  <div className="text-2xl font-black mb-1" style={{ color }}>{value}</div>
                  <div className="text-xs text-gray-500 leading-tight">{label}</div>
                </div>
              ))}
            </motion.div>

            {/* Roadmap progress */}
            {roadmapProgress.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-[#bc13fe]" />
                  <h2 className="text-base font-bold text-white">Learning Progress</h2>
                  <span className="text-[10px] font-mono text-gray-600 ml-auto">{roadmapProgress.length} roadmap{roadmapProgress.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-3">
                  {roadmapProgress.map((rp: any, i: number) => (
                    <Link key={rp.roadmap?.id ?? i} href={`/roadmaps/${rp.roadmap?.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 + i * 0.04 }}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/8 bg-[#141414] hover:border-[#bc13fe]/30 transition-all cursor-pointer group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-semibold text-white group-hover:text-[#bc13fe] transition-colors truncate">
                              {rp.roadmap?.title}
                            </span>
                            {rp.pct === 100 && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${rp.pct}%`,
                                  background: rp.pct === 100
                                    ? "linear-gradient(90deg, #4ade80, #22d3ee)"
                                    : "linear-gradient(90deg, #bc13fe, #7c3aed)",
                                }}
                              />
                            </div>
                            <span className="text-xs font-mono text-gray-500 shrink-0">
                              {rp.completedCount}/{rp.totalSteps}
                            </span>
                            <span className="text-xs font-bold shrink-0" style={{ color: rp.pct === 100 ? "#4ade80" : "#bc13fe" }}>
                              {rp.pct}%
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-[#bc13fe] transition-colors shrink-0" />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Submitted resources */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-primary" />
                <h2 className="text-base font-bold text-white">Submitted Resources</h2>
                <span className="text-[10px] font-mono text-gray-600 ml-auto">{submitted.length}</span>
              </div>

              {submitted.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center rounded-2xl border border-white/8 bg-[#141414]">
                  <BookOpen className="w-8 h-8 text-gray-700 mb-3" />
                  <p className="text-gray-500 text-sm">You haven't submitted any resources yet.</p>
                  <Link href="/resources">
                    <button className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold border transition-all"
                      style={{ borderColor: "rgba(0,243,255,0.3)", color: "#00f3ff", background: "rgba(0,243,255,0.08)" }}>
                      Browse Resources
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {submitted.map((r: any, i: number) => {
                    let domain = "";
                    try { domain = new URL(r.url).hostname.replace("www.", ""); } catch {}
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16 + i * 0.03 }}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/8 bg-[#141414]"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white truncate">{r.title}</span>
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider shrink-0",
                              r.status === "approved"
                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                                : "bg-amber-500/10 border-amber-500/25 text-amber-400"
                            )}>
                              {r.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-600 font-mono">{domain}</span>
                            <span className="text-[10px] text-gray-700">·</span>
                            <span className="text-[10px] text-gray-600">{r.category}</span>
                          </div>
                        </div>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all"
                        >
                          <ExternalLink className="w-3 h-3 text-gray-500" />
                        </a>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
