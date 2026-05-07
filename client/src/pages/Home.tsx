import { motion, useScroll, useTransform } from "framer-motion";
import {
  Search, Map, ExternalLink, Plus, ArrowRight,
  BookOpen, Compass, Users, Zap, Shield, Star,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Resource, Roadmap } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// ─── Reusable animation variants ────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const stagger = (delay = 0.08) => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
});

const vp = { once: true, margin: "-80px" };

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({
  children, className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("w-full px-4 py-14 md:py-24 relative z-10", className)}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

// ─── Animated section heading ────────────────────────────────────────────────
function SectionHeading({
  label, title, accent, subtitle,
}: { label: string; title: string; accent: string; subtitle?: string }) {
  return (
    <motion.div
      variants={stagger(0.1)}
      initial="hidden"
      whileInView="visible"
      viewport={vp}
      className="text-center mb-10 md:mb-16"
    >
      <motion.span
        variants={fadeUp}
        className="inline-block text-xs font-mono tracking-widest uppercase text-primary mb-4 px-3 py-1 rounded-full border border-primary/20 bg-primary/5"
      >
        {label}
      </motion.span>
      <motion.h2
        variants={fadeUp}
        className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
      >
        {title} <span className="text-primary">{accent}</span>
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-2xl mx-auto">
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [cursorTrailEnabled, setCursorTrailEnabled] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    document.title = "4ever Rooted — Free Developer Learning Platform";
    return () => { document.title = "4ever Rooted — Developer Learning Platform"; };
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("cursorTrailEnabled");
    setCursorTrailEnabled(saved === "true");
  }, []);
  const { toast } = useToast();
  const heroRef = useRef(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -60]);
  const heroOpacity = useTransform(scrollY, [0, 350], [1, 0]);

  // ── Door-opening arc: "4ever" sweeps LEFT, "Rooted" sweeps RIGHT ─────────
  const arcProgress = useTransform(scrollY, [0, 560], [0, 1]);

  // "4ever" — quarter-circle arc going LEFT and slightly upward
  const foreverX = useTransform(arcProgress, (p: number) =>
    -Math.sin(Math.min(p, 1) * (Math.PI / 2)) * 520
  );
  const foreverY = useTransform(arcProgress, (p: number) =>
    -(1 - Math.cos(Math.min(p, 1) * (Math.PI / 2))) * 140
  );
  const foreverRot = useTransform(arcProgress, (p: number) => p * -22);
  const foreverOp  = useTransform(scrollY, [0, 300, 560], [1, 0.55, 0]);

  // "Rooted" — mirror arc going RIGHT and slightly upward
  const rootedX   = useTransform(arcProgress, (p: number) =>
    Math.sin(Math.min(p, 1) * (Math.PI / 2)) * 520
  );
  const rootedY   = useTransform(arcProgress, (p: number) =>
    -(1 - Math.cos(Math.min(p, 1) * (Math.PI / 2))) * 140
  );
  const rootedRot = useTransform(arcProgress, (p: number) => p * 22);
  const rootedOp  = useTransform(scrollY, [0, 300, 560], [1, 0.55, 0]);

  const { data: recentResources, isLoading: loadingResources } = useQuery<Resource[]>({
    queryKey: ["/api/resources/recent"],
    queryFn: async () => {
      const res = await fetch("/api/resources?recent=true", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: allRoadmaps, isLoading: loadingRoadmaps } = useQuery<Roadmap[]>({
    queryKey: ["/api/roadmaps"],
    queryFn: async () => {
      const res = await fetch("/api/roadmaps", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: dbStats, isLoading: loadingStats } = useQuery<{ resourceCount: number; roadmapCount: number }>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/resources", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setIsSubmitOpen(false);
      toast({ title: "Success!", description: "Resource submitted successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to submit", variant: "destructive" });
    },
  });

  const handleResourceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    submitMutation.mutate(data);
  };

  const features = [
    {
      icon: Compass,
      title: "Structured Roadmaps",
      description: "Follow curated, step-by-step learning paths built by the community. From beginner to expert — every skill covered.",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      icon: BookOpen,
      title: "Curated Resources",
      description: "Hand-picked tools, books, courses, and references. No fluff — only the resources that actually help you grow.",
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Built by developers, for developers. Submit resources, share knowledge, and grow together as a community.",
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      icon: Zap,
      title: "Always Up to Date",
      description: "Roadmaps sync automatically from roadmap.sh and the community keeps resources fresh and relevant.",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      icon: Shield,
      title: "100% Free",
      description: "No paywalls, no premium tiers. Every roadmap, every resource, every feature — completely free, forever.",
      color: "text-pink-400",
      bg: "bg-pink-500/10 border-pink-500/20",
    },
    {
      icon: Star,
      title: "Track Your Progress",
      description: "Log in to mark steps as complete, track your learning journey, and stay motivated as you level up.",
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
    },
  ];

  const stats = [
    { value: dbStats?.roadmapCount ?? allRoadmaps?.length ?? "—", label: "Roadmaps", suffix: "+" },
    { value: dbStats?.resourceCount ?? "—", label: "Resources", suffix: "+" },
    { value: 100, label: "Free Forever", suffix: "%" },
    { value: 17, label: "Detailed Paths", suffix: "" },
  ];

  const roadmapCategories = [
    { label: "Frontend Developer", icon: "🖥️", slug: "frontend" },
    { label: "Backend Developer", icon: "⚙️", slug: "backend" },
    { label: "DevOps Engineer", icon: "🚀", slug: "devops" },
    { label: "Machine Learning", icon: "🧠", slug: "ml" },
    { label: "Cyber Security", icon: "🛡️", slug: "security" },
    { label: "Full Stack", icon: "📦", slug: "fullstack" },
    { label: "AI Engineering", icon: "🤖", slug: "ai" },
    { label: "System Design", icon: "🗺️", slug: "system" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,243,255,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,243,255,1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,243,255,0.06),transparent)]" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-4xl w-full text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-primary px-4 py-1.5 rounded-full border border-primary/25 bg-primary/5 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Open Source · Free Forever · Built by Devs
          </motion.div>

          {/* Headline — each word gets its own circular arc on scroll */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 flex flex-row items-baseline justify-center leading-none gap-[0.2em] overflow-visible"
          >
            <motion.span
              style={{ x: foreverX, y: foreverY, rotate: foreverRot, opacity: foreverOp }}
              className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white inline-block will-change-transform"
            >
              4ever
            </motion.span>
            <motion.span
              style={{ x: rootedX, y: rootedY, rotate: rootedRot, opacity: rootedOp }}
              className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-primary inline-block will-change-transform [text-shadow:0_0_40px_rgba(0,243,255,0.4)]"
            >
              Rooted
            </motion.span>
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Your gateway to developer roadmaps, curated resources, and structured
            learning paths. Everything a developer needs — completely free.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
          >
            <Link href="/roadmaps" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-full px-8 py-5 h-auto text-base font-semibold shadow-[0_0_24px_rgba(0,243,255,0.25)] hover:shadow-[0_0_36px_rgba(0,243,255,0.4)] transition-shadow">
                <Map className="mr-2 h-4 w-4" /> Explore Roadmaps
              </Button>
            </Link>
            <Link href="/resources" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-full px-8 py-5 h-auto text-base font-semibold border-white/15 hover:bg-white/8 hover:border-white/25"
              >
                <Search className="mr-2 h-4 w-4" /> Browse Resources
              </Button>
            </Link>
          </motion.div>

          {/* Drawing note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-3 mb-3"
          >
            <p className="text-xs text-primary text-center font-mono font-bold [text-shadow:0_0_12px_rgba(0,243,255,0.55)]">
              ✨ Drawing mode
            </p>
            <Switch
              checked={cursorTrailEnabled}
              onCheckedChange={(checked) => {
                setCursorTrailEnabled(checked);
                window.localStorage.setItem("cursorTrailEnabled", String(checked));
                window.dispatchEvent(new Event("cursor-trail-toggle"));
              }}
              aria-label="Toggle cursor trail effect"
            />
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-center"
          >
            <div className="flex flex-col items-center gap-1 text-gray-600">
              <span className="text-xs font-mono tracking-wider">scroll</span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
          {loadingStats ? (
            <div className="flex justify-center">
              <LoadingSpinner size={32} />
            </div>
          ) : (
            <motion.div
              variants={stagger(0.12)}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="text-center"
                >
                  <div className="text-3xl md:text-5xl font-black text-primary mb-1">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-sm text-gray-500 font-mono tracking-wider uppercase">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <Section>
        <SectionHeading
          label="Why 4ever Rooted?"
          title="Everything you need to"
          accent="grow as a developer"
          subtitle="A single platform with structured paths, curated resources, and community knowledge — no subscriptions, no gatekeeping."
        />
        <motion.div
          variants={stagger(0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className={cn(
                "rounded-2xl border p-6 transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1",
                f.bg
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-black/20", f.bg)}>
                <f.icon className={cn("w-5 h-5", f.color)} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ── ROADMAP CATEGORIES ────────────────────────────────────────────── */}
      <Section className="bg-white/[0.015]">
        <SectionHeading
          label="Learning Paths"
          title="Pick your"
          accent="roadmap"
          subtitle={`${allRoadmaps?.length ?? 96} roadmaps across every discipline — from beginner to expert.`}
        />
        <motion.div
          variants={stagger(0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {roadmapCategories.map((cat) => (
            <motion.div key={cat.slug} variants={fadeUp}>
              <Link href="/roadmaps">
                <div className="group flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/[0.03] hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {cat.label}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          className="text-center"
        >
          <Link href="/roadmaps">
            <Button variant="outline" className="rounded-full px-8 h-11 border-white/15 hover:border-primary/40 hover:bg-primary/5 group">
              View All {allRoadmaps?.length ?? 96} Roadmaps
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </Section>

      {/* ── RECENT RESOURCES ──────────────────────────────────────────────── */}
      <Section>
        <SectionHeading
          label="Resources"
          title="Latest from the"
          accent="community"
          subtitle="Freshly added tools, courses, and references hand-picked for developers."
        />
        {loadingResources ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={48} />
          </div>
        ) : recentResources && recentResources.length > 0 ? (
          <motion.div
            variants={stagger(0.07)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10"
          >
            {recentResources.slice(0, 6).map((resource) => (
              <motion.a
                key={resource.id}
                variants={fadeUp}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-[#141414] border border-white/6 rounded-2xl p-5 hover:border-primary/25 hover:shadow-[0_0_20px_rgba(0,243,255,0.07)] transition-all duration-300 flex flex-col"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5 w-fit mb-3">
                  {resource.category}
                </span>
                <span className="text-white font-semibold text-sm leading-snug mb-1">
                  {resource.title}
                </span>
                <span className="text-gray-500 text-xs leading-relaxed line-clamp-2 flex-1">
                  {resource.description}
                </span>
              </motion.a>
            ))}
          </motion.div>
        ) : (
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} className="text-center text-gray-500 mb-10">
            No resources yet.
          </motion.p>
        )}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/resources">
            <Button variant="outline" className="rounded-full px-8 h-11 border-white/15 hover:border-primary/40 hover:bg-primary/5 group">
              Browse All Resources
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          {user && (
            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full px-8 h-11">
                  <Plus className="mr-2 h-4 w-4" /> Submit a Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#141414] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Add Resource</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleResourceSubmit} className="space-y-5 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required className="bg-black/30 border-white/10" placeholder="E.g. React 19 Docs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="url">URL</Label>
                    <Input id="url" name="url" type="url" required className="bg-black/30 border-white/10" placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" name="description" className="bg-black/30 border-white/10" placeholder="Short description..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select name="category" required>
                      <SelectTrigger className="bg-black/30 border-white/10">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                        <SelectItem value="Learning">Learning</SelectItem>
                        <SelectItem value="Programming">Programming</SelectItem>
                        <SelectItem value="Dev Tools">Dev Tools</SelectItem>
                        <SelectItem value="AI & ML">AI & ML</SelectItem>
                        <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="Design & UI">Design & UI</SelectItem>
                        <SelectItem value="Reference">Reference</SelectItem>
                        <SelectItem value="Community">Community</SelectItem>
                        <SelectItem value="Books">Books</SelectItem>
                        <SelectItem value="Practice">Practice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full h-11 flex items-center justify-center gap-2" disabled={submitMutation.isPending}>
                    {submitMutation.isPending ? (
                      <>
                        <LoadingSpinner size={18} />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      "Post Resource"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      </Section>

      {/* ── CTA SECTION ───────────────────────────────────────────────────── */}
      <Section className="bg-white/[0.015]">
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          className="relative rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 p-7 sm:p-12 md:p-16 text-center overflow-hidden"
        >
          {/* Glow orb */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(0,243,255,0.08),transparent)] pointer-events-none" />

          <motion.span
            variants={fadeUp}
            className="inline-block text-xs font-mono tracking-widest uppercase text-primary mb-5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5"
          >
            Start Today
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-6xl font-black mb-5 tracking-tight"
          >
            Your learning journey{" "}
            <span className="text-primary [text-shadow:0_0_30px_rgba(0,243,255,0.4)]">
              starts here
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-gray-400 text-lg mb-10 max-w-xl mx-auto"
          >
            Join thousands of developers using 4ever Rooted to map out their
            growth, discover new tools, and level up their skills.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/roadmaps" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-full px-10 py-5 h-auto text-base font-semibold shadow-[0_0_30px_rgba(0,243,255,0.3)] hover:shadow-[0_0_45px_rgba(0,243,255,0.45)] transition-shadow">
                <Map className="mr-2 h-4 w-4" /> Pick a Roadmap
              </Button>
            </Link>
            <Link href="/resources" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto rounded-full px-10 py-5 h-auto text-base font-semibold border-white/15 hover:border-primary/30 hover:bg-primary/5">
                <BookOpen className="mr-2 h-4 w-4" /> Explore Resources
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </Section>

      <Footer />
    </div>
  );
}
