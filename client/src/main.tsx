import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { ClerkBridge } from "@/lib/ClerkBridge";
import { UserContext } from "@/lib/user-context";
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const FRONTEND_API = import.meta.env.VITE_CLERK_FRONTEND_API;

createRoot(document.getElementById("root")!).render(
  PUBLISHABLE_KEY ? (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      frontendApi={FRONTEND_API}
      afterSignOutUrl="/"
    >
      <ClerkBridge>
        <App />
      </ClerkBridge>
    </ClerkProvider>
  ) : (
    <UserContext.Provider value={{ user: null, isLoading: false, signOut: () => {} }}>
      <App />
    </UserContext.Provider>
  )
);
