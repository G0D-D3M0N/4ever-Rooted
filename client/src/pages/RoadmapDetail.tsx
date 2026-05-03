import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useRoadmap } from "@/hooks/use-roadmaps";
import { useUserProgress, useToggleProgress } from "@/hooks/use-progress";
import { useUser } from "@/hooks/use-user";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  ArrowLeft,
  ChevronDown,
  Lock,
  BookOpen,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RoadmapDetail() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const [, setLocation] = useLocation();
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const { data: roadmap, isLoading } = useRoadmap(id);
  const { user } = useUser();
  const { data: progress } = useUserProgress();
  const toggleProgress = useToggleProgress();

  useEffect(() => {
    if (roadmap) {
      document.title = `${roadmap.title} — 4ever Rooted`;
    } else {
      document.title = "Roadmap — 4ever Rooted";
    }
    return () => { document.title = "4ever Rooted — Developer Learning Platform"; };
  }, [roadmap]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-mono">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Roadmap not found</p>
          <button
            onClick={() => setLocation("/roadmaps")}
            className="text-primary hover:underline text-sm"
          >
            ← Back to Roadmaps
          </button>
        </div>
      </div>
    );
  }

  const steps = roadmap.steps ?? [];
  const completedIds = new Set(
    (progress ?? [])
      .filter((p) => steps.some((s) => s.id === p.stepId))
      .map((p) => p.stepId)
  );
  const totalSteps = steps.length;
  const completedCount = completedIds.size;
  const pct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  // Global order for sequential locking
  const sortedByOrder = [...steps].sort((a, b) => a.order - b.order);

  const isCompleted = (stepId: number) => completedIds.has(stepId);

  const isUnlocked = (stepId: number) => {
    const idx = sortedByOrder.findIndex((s) => s.id === stepId);
    if (idx <= 0) return true;
    return isCompleted(sortedByOrder[idx - 1].id);
  };

  const handleToggle = (stepId: number) => {
    if (!user) return;
    if (!isUnlocked(stepId)) return;
    toggleProgress.mutate({ stepId, completed: !isCompleted(stepId) });
  };

  const toggleExpand = (stepId: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  // Group steps by section, preserving order
  const sections: string[] = [];
  const grouped: Record<string, typeof steps> = {};
  for (const step of steps) {
    if (!grouped[step.section]) {
      grouped[step.section] = [];
      sections.push(step.section);
    }
    grouped[step.section].push(step);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <div className="h-16 shrink-0" />

      {/* ── Sticky progress header ────────────────────────────────── */}
      <div className="sticky top-16 z-40 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setLocation("/roadmaps")}
            className="shrink-0 flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Roadmaps</span>
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate mb-1">
              {roadmap.title}
            </p>
            <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #00f3ff, #00c8ff)",
                  boxShadow: "0 0 10px rgba(0,243,255,0.5)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span
              className="text-lg font-bold"
              style={{ color: "#00f3ff", textShadow: "0 0 12px rgba(0,243,255,0.5)" }}
            >
              {pct}%
            </span>
            <p className="text-[10px] text-gray-500 leading-none">
              {completedCount}/{totalSteps}
            </p>
          </div>
        </div>
      </div>

      <main className="flex-grow pt-8 pb-24 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {/* ── Page title area ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            {roadmap.title}
          </h1>
          <p className="text-gray-400 leading-relaxed max-w-2xl">
            {roadmap.description}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mt-5">
            {[
              { label: "Total Steps", value: totalSteps, color: "#a78bfa" },
              { label: "Completed", value: completedCount, color: "#34d399" },
              { label: "Remaining", value: totalSteps - completedCount, color: "#f59e0b" },
              { label: "Sections", value: sections.length, color: "#00f3ff" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/8 bg-white/[0.03]"
              >
                <span className="text-xl font-bold" style={{ color }}>
                  {value}
                </span>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Timeline ────────────────────────────────────────────── */}
        <div className="space-y-10">
          {sections.map((section, sectionIdx) => {
            const sectionSteps = grouped[section];
            const sectionCompleted = sectionSteps.filter((s) => isCompleted(s.id)).length;

            return (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: sectionIdx * 0.05 }}
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-1 h-6 rounded-full"
                    style={{
                      background: "linear-gradient(180deg, #00f3ff, #0080ff)",
                      boxShadow: "0 0 8px rgba(0,243,255,0.4)",
                    }}
                  />
                  <h2 className="text-sm font-bold tracking-widest uppercase text-gray-300">
                    {section}
                  </h2>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-gray-600 font-mono">
                    {sectionCompleted}/{sectionSteps.length}
                  </span>
                </div>

                {/* Steps */}
                <div className="relative ml-3">
                  {/* Vertical connector line */}
                  <div
                    className="absolute left-[18px] top-5 bottom-5 w-px"
                    style={{ background: "linear-gradient(180deg, rgba(0,243,255,0.2), transparent)" }}
                  />

                  <div className="space-y-3">
                    {sectionSteps.map((step, stepIdx) => {
                      const done = isCompleted(step.id);
                      const locked = !isUnlocked(step.id);
                      const expanded = expandedSteps.has(step.id);
                      let resources: { title: string; url: string }[] = [];
                      try {
                        resources = step.resources
                          ? typeof step.resources === "string"
                            ? JSON.parse(step.resources)
                            : step.resources
                          : [];
                      } catch {}

                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: stepIdx * 0.04 }}
                          className={cn("relative flex gap-3 sm:gap-4", locked && "opacity-50")}
                        >
                          {/* Circle checkbox */}
                          <button
                            onClick={() => handleToggle(step.id)}
                            title={
                              locked
                                ? "Complete the previous step first"
                                : user
                                ? done
                                  ? "Mark incomplete"
                                  : "Mark complete"
                                : "Sign in to track progress"
                            }
                            disabled={locked}
                            className={cn(
                              "relative z-10 shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 text-xs font-bold border-2",
                              done
                                ? "text-[#0e0e0e] border-transparent"
                                : locked
                                ? "bg-[#0e0e0e] border-white/8 text-gray-700 cursor-not-allowed"
                                : user
                                ? "bg-[#161616] border-white/15 text-gray-500 hover:border-primary/60 hover:text-primary/70 cursor-pointer"
                                : "bg-[#161616] border-white/10 text-gray-700 cursor-not-allowed"
                            )}
                            style={
                              done
                                ? {
                                    background: "linear-gradient(135deg, #00f3ff, #00c8ff)",
                                    boxShadow: "0 0 14px rgba(0,243,255,0.55)",
                                  }
                                : {}
                            }
                          >
                            {done ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : locked ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <span>{step.order}</span>
                            )}
                          </button>

                          {/* Step card */}
                          <div
                            className={cn(
                              "flex-1 rounded-xl border transition-all duration-300",
                              done
                                ? "border-primary/25 bg-primary/[0.04]"
                                : locked
                                ? "border-white/5 bg-[#111]"
                                : "border-white/8 bg-[#161616] hover:border-white/15"
                            )}
                            style={
                              done
                                ? { boxShadow: "0 0 20px rgba(0,243,255,0.06)" }
                                : {}
                            }
                          >
                            {/* Card header */}
                            <div
                              className="flex items-start justify-between gap-3 px-4 py-3 cursor-pointer"
                              onClick={() => toggleExpand(step.id)}
                            >
                              <div className="flex-1 min-w-0">
                                <h3
                                  className={cn(
                                    "font-semibold text-sm leading-snug transition-colors",
                                    done ? "text-white/90" : "text-gray-200"
                                  )}
                                >
                                  {step.title}
                                </h3>
                                {!expanded && (
                                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                                    {step.description}
                                  </p>
                                )}
                              </div>
                              <motion.div
                                animate={{ rotate: expanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="shrink-0 mt-0.5 text-gray-600"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </motion.div>
                            </div>

                            {/* Expandable content */}
                            <AnimatePresence initial={false}>
                              {expanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 border-t border-white/5 pt-3">
                                    <p className="text-gray-400 text-sm leading-relaxed mb-3">
                                      {step.description}
                                    </p>

                                    {resources.length > 0 && (
                                      <div>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 flex items-center gap-1.5 font-semibold">
                                          <BookOpen className="w-3 h-3" />
                                          Resources
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {resources.map((r, idx) => (
                                            <a
                                              key={idx}
                                              href={r.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-gray-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <ExternalLink className="w-3 h-3 shrink-0 group-hover:text-primary transition-colors" />
                                              {r.title}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Guest sign-in prompt ──────────────────────────────────── */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 rounded-2xl border border-white/10 bg-[#161616] p-8 text-center"
            style={{ boxShadow: "0 0 40px rgba(0,243,255,0.04)" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(0,243,255,0.1)", border: "1px solid rgba(0,243,255,0.2)" }}
            >
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Track Your Progress</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
              Sign in to check off steps, save your progress, and pick up where you left off across any device.
            </p>
            <button
              onClick={() => setLocation("/auth")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-black transition-all"
              style={{
                background: "linear-gradient(135deg, #00f3ff, #00c8ff)",
                boxShadow: "0 0 20px rgba(0,243,255,0.3)",
              }}
            >
              <Zap className="w-4 h-4" />
              Sign In to Track Progress
            </button>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
