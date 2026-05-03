import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Mail, Heart, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function About() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.title = "About — 4ever Rooted";
    return () => { document.title = "4ever Rooted — Developer Learning Platform"; };
  }, []);

  async function handleFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 600));
    setSending(false);
    setFeedback("");
    toast({
      title: "Feedback received!",
      description: "Thanks for helping us improve 4ever Rooted. We read every suggestion.",
      duration: 4000,
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
            <Heart className="w-8 h-8 text-primary fill-primary/20" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Rooted in <span className="text-primary text-glow">Community</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We're building a space where developers don't just learn to code—they learn to grow together.
          </p>
        </motion.div>

        <div className="grid gap-12 mb-20">
          <section className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 relative z-10">
              <Code2 className="text-primary" /> Our Mission
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed relative z-10">
              <p>
                The journey to becoming a developer is often lonely and overwhelming. Tutorials are everywhere, but structured guidance is rare.
              </p>
              <p>
                <strong>4ever Rooted</strong> exists to bridge that gap. We curate high-quality resources and build step-by-step roadmaps that demystify complex topics. But more importantly, we are a student-first collective.
              </p>
              <p>
                Whether you're writing your first "Hello World" or deploying scalable microservices, you belong here.
              </p>
            </div>
          </section>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Connect With Us</h3>
          <div className="flex justify-center gap-6">
            {[
              { icon: Github, href: "https://github.com/topics/developer-roadmap", label: "GitHub" },
              { icon: Twitter, href: "https://twitter.com/search?q=developer+roadmap", label: "Twitter" },
              { icon: Linkedin, href: "https://linkedin.com/learning", label: "LinkedIn" },
              { icon: Mail, href: "mailto:hello@4everrooted.dev", label: "Email" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={social.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="p-4 bg-[#1a1a1a] rounded-full text-gray-400 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300 border border-white/5 hover:border-primary/50"
                aria-label={social.label}
              >
                <social.icon className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>

        {/* Feedback Form */}
        <div className="mt-24 p-8 md:p-12 bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Have suggestions?</h3>
          <p className="text-gray-400 mb-8">We build this for you. Tell us what resources or roadmaps you need next.</p>
          
          <form className="max-w-md mx-auto space-y-4" onSubmit={handleFeedback}>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="I'd love to see a roadmap for..."
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all h-32 resize-none"
            />
            <button
              type="submit"
              disabled={sending || !feedback.trim()}
              className="w-full py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send Feedback"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
