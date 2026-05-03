import { useEffect } from "react";
import { SignIn } from "@clerk/clerk-react";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Rocket, Lock } from "lucide-react";

const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function AuthPage() {
  const { user } = useUser();
  const [, navigate] = useLocation();

  useEffect(() => {
    document.title = "Sign In — 4ever Rooted";
    return () => { document.title = "4ever Rooted — Developer Learning Platform"; };
  }, []);

  if (user) {
    navigate("/");
    return null;
  }

  if (!CLERK_ENABLED) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border"
              style={{ background: "rgba(0,243,255,0.08)", borderColor: "rgba(0,243,255,0.2)" }}
            >
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-white mb-3">Auth Not Configured</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Clerk authentication keys are not set yet. Add{" "}
              <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">
                VITE_CLERK_PUBLISHABLE_KEY
              </code>{" "}
              and{" "}
              <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">
                CLERK_SECRET_KEY
              </code>{" "}
              to enable login.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Rocket className="w-7 h-7 text-primary" />
            <span className="font-bold text-2xl tracking-tighter text-white">
              4ever <span className="text-primary">Rooted</span>
            </span>
          </div>
          <SignIn
            routing="hash"
            fallbackRedirectUrl="/"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-[#141414] border border-white/10 shadow-2xl rounded-2xl",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-400",
                socialButtonsBlockButton:
                  "bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all",
                dividerLine: "bg-white/10",
                dividerText: "text-gray-500",
                formFieldLabel: "text-gray-300",
                formFieldInput:
                  "bg-[#1a1a1a] border-white/10 text-white focus:border-primary focus:ring-primary/20",
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-black font-semibold transition-all",
                footerActionLink: "text-primary hover:text-primary/80",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-primary",
                alertText: "text-red-400",
                formFieldSuccessText: "text-emerald-400",
              },
              variables: {
                colorPrimary: "#00f3ff",
                colorBackground: "#141414",
                colorText: "#ffffff",
                colorTextSecondary: "#9ca3af",
                colorInputBackground: "#1a1a1a",
                colorInputText: "#ffffff",
                borderRadius: "0.75rem",
              },
            }}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
