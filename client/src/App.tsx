import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CursorTrail } from "@/components/CursorTrail";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Resources from "@/pages/Resources";
import Roadmaps from "@/pages/Roadmaps";
import RoadmapDetail from "@/pages/RoadmapDetail";
import About from "@/pages/About";
import Paths from "@/pages/Paths";
import Admin from "@/pages/Admin";
import AuthPage from "@/pages/AuthPage";
import SearchPage from "@/pages/Search";
import Profile from "@/pages/Profile";
import Changelog from "@/pages/Changelog";
import Leaderboard from "@/pages/Leaderboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/resources" component={Resources} />
      <Route path="/roadmaps" component={Roadmaps} />
      <Route path="/roadmaps/:id" component={RoadmapDetail} />
      <Route path="/paths" component={Paths} />
      <Route path="/about" component={About} />
      <Route path="/admin" component={Admin} />
      <Route path="/search" component={SearchPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/changelog" component={Changelog} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CursorTrail />
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
