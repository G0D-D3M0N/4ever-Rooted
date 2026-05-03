import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, ThumbsUp, Users, Star, ExternalLink,
  Crown, Medal, Award, Loader2, ArrowUpRight, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return ""; }
}

function shortId(id: string) {
  if (!id) return "Anonymous";
  return id.slice(0, 8) + "…";
}

const RANK_ICONS = [Crown, Trophy, Medal];
const RANK_COLORS = ["#fbbf24", "#94a3b8", "#cd7c3f"];
const RANK_LABELS = ["1st", "2nd", "3rd"];

function RankBadge({ rank }: { rank: number }) {
  if (rank < 3) {
    const Icon = RANK_ICONS[rank];
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border"
        style={{ color: RANK_COLORS[rank], background: `${RANK_COLORS[rank]}15`, borderColor: `${RANK_COLORS[rank]}40` }}
      >
        <Icon className="w-4 h-4" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/5 border border-white/10">
      <span className="text-xs font-bold text-gray-500">#{rank + 1}</span>
    </div>
  );
}

export default function Leaderboard() {
  useEffect(() => {
    document.title = "Leaderboard — 4ever Rooted";
    return () => { document.title = "4ever Rooted — Developer Learning Platform"; };
  }, []);

  const { data, isLoading } = useQuery<{
    topSubmitters: Array<{ userId: string; count: number; approvedCount: number }>;
    topResources: any[];
    stats: { totalResources: number; totalVotes: number; totalSubmitters: number };
  }>({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to load leaderboard");
      return res.json();
    },
    staleTime: 60000,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <div className="h-16 shrink-0" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5 border"
            style={{ background: "rgba(251,191,36,0.08)", borderColor: "rgba(251,191,36,0.2)", color: "#fbbf24" }}
          >
            <Trophy className="w-3.5 h-3.5" />
            Community Rankings
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Leader<span className="text-primary" style={{ textShadow: "0 0 30px rgba(0,243,255,0.5)" }}>board</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Celebrating contributors who make this platform better — top resource sharers and most-loved links.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !data ? null : (
          <div className="space-y-10">

            {/* ── Stats Row ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { icon: BookOpen, label: "Free Resources", value: data.stats.totalResources.toLocaleString(), color: "#00f3ff" },
                { icon: ThumbsUp, label: "Total Upvotes", value: data.stats.totalVotes.toLocaleString(), color: "#a855f7" },
                { icon: Users, label: "Contributors", value: data.stats.totalSubmitters.toLocaleString(), color: "#fbbf24" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="rounded-2xl p-4 sm:p-6 text-center border"
                  style={{ background: `${color}08`, borderColor: `${color}20` }}
                >
                  <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
                  <div className="text-2xl sm:text-3xl font-black text-white mb-1">{value}</div>
                  <div className="text-[11px] sm:text-xs text-gray-500 font-medium">{label}</div>
                </div>
              ))}
            </motion.div>

            {/* ── Top Contributors ── */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0"
                  style={{ background: "rgba(251,191,36,0.1)", borderColor: "rgba(251,191,36,0.25)" }}
                >
                  <Trophy className="w-4.5 h-4.5 text-amber-400" style={{ width: "1.1rem", height: "1.1rem" }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Top Contributors</h2>
                  <p className="text-xs text-gray-500">Most approved resources submitted</p>
                </div>
              </div>

              {data.topSubmitters.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-white/8 bg-white/3">
                  <Users className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No contributors yet. Be the first to submit a resource!</p>
                  <Link href="/resources">
                    <button className="mt-3 text-xs text-primary/70 hover:text-primary transition-colors">Browse Resources →</button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {data.topSubmitters.map((submitter, i) => (
                      <motion.div
                        key={submitter.userId}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className={cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all",
                          i === 0
                            ? "border-amber-500/30 bg-amber-500/5"
                            : i === 1
                            ? "border-slate-400/20 bg-slate-400/4"
                            : i === 2
                            ? "border-amber-700/20 bg-amber-700/4"
                            : "border-white/8 bg-white/3 hover:border-white/15"
                        )}
                      >
                        <RankBadge rank={i} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white font-mono">
                              user_{shortId(submitter.userId)}
                            </span>
                            {i < 3 && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                                style={{ color: RANK_COLORS[i], background: `${RANK_COLORS[i]}15`, borderColor: `${RANK_COLORS[i]}30` }}
                              >
                                {RANK_LABELS[i]}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5">
                            Community contributor
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-black text-white">{submitter.approvedCount}</div>
                          <div className="text-[10px] text-gray-600 font-mono">
                            resource{submitter.approvedCount !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.section>

            {/* ── Most Loved Resources ── */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0"
                  style={{ background: "rgba(168,85,247,0.1)", borderColor: "rgba(168,85,247,0.25)" }}
                >
                  <Star className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Most Loved Resources</h2>
                  <p className="text-xs text-gray-500">Highest upvoted links from the community</p>
                </div>
              </div>

              {data.topResources.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-white/8 bg-white/3">
                  <ThumbsUp className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No votes yet. Browse resources and upvote your favorites!</p>
                  <Link href="/resources">
                    <button className="mt-3 text-xs text-primary/70 hover:text-primary transition-colors">Browse Resources →</button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {data.topResources.map((resource: any, i: number) => {
                      const domain = getDomain(resource.url);
                      return (
                        <motion.a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i }}
                          className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/8 bg-white/3 hover:border-primary/25 hover:bg-primary/3 transition-all group"
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border font-bold text-sm"
                            style={{
                              background: i < 3 ? `${RANK_COLORS[i]}15` : "rgba(255,255,255,0.05)",
                              borderColor: i < 3 ? `${RANK_COLORS[i]}40` : "rgba(255,255,255,0.1)",
                              color: i < 3 ? RANK_COLORS[i] : "#6b7280",
                            }}
                          >
                            {i + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                                {resource.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {domain && <span className="text-[10px] text-gray-600 font-mono">{domain}</span>}
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/8 text-gray-500"
                              >
                                {resource.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/8 border border-purple-500/20">
                              <ThumbsUp className="w-3 h-3 text-purple-400" />
                              <span className="text-sm font-bold text-purple-300">{resource.votes}</span>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-primary group-hover:scale-110 transition-all" />
                          </div>
                        </motion.a>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.section>

            {/* ── CTA ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6 border text-center"
              style={{
                background: "linear-gradient(135deg, rgba(0,243,255,0.04), rgba(168,85,247,0.04))",
                borderColor: "rgba(0,243,255,0.12)",
              }}
            >
              <Award className="w-8 h-8 text-primary/60 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-2">Want to appear on the leaderboard?</h3>
              <p className="text-sm text-gray-500 mb-4">
                Share great free resources with the community. The more you contribute, the higher you rank.
              </p>
              <Link href="/resources">
                <button
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all"
                  style={{
                    background: "rgba(0,243,255,0.08)",
                    borderColor: "rgba(0,243,255,0.25)",
                    color: "#00f3ff",
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Submit a Resource
                </button>
              </Link>
            </motion.div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
