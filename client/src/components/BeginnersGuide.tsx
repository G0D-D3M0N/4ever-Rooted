import { motion } from "framer-motion";
import { BookOpen, Compass, Search, BookMarked, Award, Shield, ArrowRight } from "lucide-react";

const SECTIONS = [
  {
    id: "intro",
    icon: Compass,
    title: "What is 4ever Rooted?",
    content: "4ever Rooted is a curated directory of the best free resources for developers, engineers, and tech enthusiasts. Every link is hand-picked, categorized, and maintained by the community.",
  },
  {
    id: "what-you-can-do",
    icon: BookMarked,
    title: "What You Can Do",
    content: "Browse hundreds of free tools across categories like Programming, AI/ML, Cybersecurity, Design, and more. Learn with interactive platforms, build with powerful tools, and connect with communities.",
    subs: [
      { label: "Learn to code with interactive platforms", color: "text-purple-400" },
      { label: "Discover free AI tools and models", color: "text-indigo-400" },
      { label: "Practice cybersecurity in safe wargames", color: "text-orange-400" },
      { label: "Find the perfect icon set or design asset", color: "text-pink-400" },
      { label: "Read free programming books and guides", color: "text-orange-300" },
      { label: "Prepare for technical interviews", color: "text-green-400" },
    ],
  },
  {
    id: "how-to-use",
    icon: Search,
    title: "How to Use This Directory",
    content: "Use the sidebar to browse by category, or search for specific topics. Each resource card includes a description and tags to help you decide quickly. Click to open the link in a new tab.",
  },
  {
    id: "contribute",
    icon: Award,
    title: "Contribute",
    content: "Found a great free resource that's missing? Click 'Submit a Resource' in the sidebar. Your submission goes through admin review before being listed. Every contribution helps the community grow.",
  },
  {
    id: "safety",
    icon: Shield,
    title: "Staying Safe",
    content: "Only use trusted links from verified sources. Be cautious with mirrors or lookalike domains. Never enter credentials on untrusted sites. Report any broken or suspicious links to the admins.",
  },
];

const NAV_ITEMS = SECTIONS.map(s => ({ id: s.id, label: s.title }));

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function BeginnersGuide() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 border"
          style={{ background: "rgba(0,243,255,0.08)", borderColor: "rgba(0,243,255,0.2)", color: "#00f3ff" }}
        >
          <BookOpen className="w-3 h-3" />
          Beginner's Guide
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-3">
          Welcome to <span className="text-primary" style={{ textShadow: "0 0 24px rgba(0,243,255,0.4)" }}>4ever Rooted</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
          Your gateway to the best free developer resources on the internet. Curated, organized, and community-driven.
        </p>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-2 justify-center mb-10"
      >
        {NAV_ITEMS.map(n => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/8 border border-white/5 transition-all"
          >
            <ArrowRight className="w-2.5 h-2.5" />
            {n.label}
          </a>
        ))}
      </motion.div>

      {/* Sections */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {SECTIONS.map(s => (
          <motion.section key={s.id} id={s.id} variants={item} className="scroll-mt-20">
            <div
              className="rounded-xl p-5 border transition-all hover:border-white/15"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                  style={{ background: "rgba(0,243,255,0.08)", borderColor: "rgba(0,243,255,0.2)" }}
                >
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{s.title}</h2>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">{s.content}</p>
                </div>
              </div>
              {s.subs && (
                <div className="ml-11 space-y-1">
                  {s.subs.map((sub, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-1 h-1 rounded-full bg-current shrink-0" style={{ color: sub.color.replace("text-", "") }} />
                      <span className={sub.color}>{sub.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-10 text-center"
      >
        <p className="text-gray-500 text-xs mb-3">Ready to explore?</p>
        <p className="text-gray-600 text-[10px]">Pick a category from the sidebar to start browsing resources.</p>
      </motion.div>
    </div>
  );
}
