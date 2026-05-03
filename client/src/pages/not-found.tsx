import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Home, Map, BookOpen, ArrowLeft } from "lucide-react";

export default function NotFound() {
  useEffect(() => {
    document.title = "404 Not Found — 4ever Rooted";
    return () => { document.title = "4ever Rooted — Developer Learning Platform"; };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          {/* Glowing 404 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6"
          >
            <span
              className="text-[8rem] font-black leading-none tracking-tighter select-none"
              style={{
                background: "linear-gradient(135deg, #00f3ff, #0080ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 40px rgba(0,243,255,0.3))",
              }}
            >
              404
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white mb-3"
          >
            Page not found
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-gray-500 text-sm leading-relaxed mb-10"
          >
            The page you're looking for doesn't exist or may have been removed.
            Let's get you back on track.
          </motion.p>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all w-full sm:w-auto justify-center"
                style={{ background: "linear-gradient(135deg, #00f3ff, #00c8ff)", boxShadow: "0 0 20px rgba(0,243,255,0.3)" }}>
                <Home className="w-4 h-4" />
                Home
              </button>
            </Link>
            <Link href="/roadmaps">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-all w-full sm:w-auto justify-center">
                <Map className="w-4 h-4" />
                Roadmaps
              </button>
            </Link>
            <Link href="/resources">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-all w-full sm:w-auto justify-center">
                <BookOpen className="w-4 h-4" />
                Resources
              </button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Go back
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
