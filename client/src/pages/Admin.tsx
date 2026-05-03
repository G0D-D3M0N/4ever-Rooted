import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useUser } from "@/hooks/use-user";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Check, X, ExternalLink, Clock, Tag, User,
  AlertTriangle, CheckCircle2, Loader2, Inbox, Trash2,
  BookOpen, Map, ChevronRight, Plus, Pencil, Save,
  SquareCheckBig, ChevronDown, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

type Tab = "pending" | "resources" | "roadmaps";

const CATEGORIES = [
  "Learning","Programming","Dev Tools","AI & ML","Cybersecurity",
  "Design & UI","Reference","Community","Books","Practice",
  "Entertainment","General Tools",
];
const ROADMAP_CATEGORIES = ["Frontend","Backend","DevOps","Full Stack","Mobile","AI & ML","Cybersecurity","Data Science","Game Dev","System Design","Other"];
const ICONS = ["brain","shield","layers","globe","database","terminal","code","cpu","server","cloud","zap","star"];

// ── Edit Resource Modal ─────────────────────────────────────────────────────
function EditResourceModal({ resource, onClose, onSave }: { resource: any; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    title: resource.title ?? "",
    url: resource.url ?? "",
    category: resource.category ?? "Learning",
    subcategory: resource.subcategory ?? "",
    description: resource.description ?? "",
    tags: Array.isArray(resource.tags) ? resource.tags.join(", ") : "",
    warning: resource.warning ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      tags: form.tags ? JSON.stringify(form.tags.split(",").map((t: string) => t.trim()).filter(Boolean)) : null,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: "#161616", border: "1px solid rgba(0,243,255,0.15)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Pencil className="w-4 h-4 text-primary" /> Edit Resource</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"><X className="w-3.5 h-3.5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Title *</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">URL *</label>
            <input required type="url" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Subcategory</label>
              <input value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Description *</label>
            <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Warning (optional)</label>
            <input value={form.warning} onChange={e => setForm(f => ({ ...f, warning: e.target.value }))} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-white/5 border border-white/10 hover:border-white/20 transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "rgba(0,243,255,0.12)", border: "1px solid rgba(0,243,255,0.3)", color: "#00f3ff" }}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Step form within the Create Roadmap modal ──────────────────────────────
type StepDraft = { title: string; description: string; section: string; resources: { title: string; url: string }[] };

function StepBuilder({ steps, setSteps }: { steps: StepDraft[]; setSteps: (s: StepDraft[]) => void }) {
  function addStep() {
    setSteps([...steps, { title: "", description: "", section: "Fundamentals", resources: [] }]);
  }
  function removeStep(i: number) {
    setSteps(steps.filter((_, idx) => idx !== i));
  }
  function updateStep(i: number, field: keyof StepDraft, value: any) {
    const next = [...steps];
    (next[i] as any)[field] = value;
    setSteps(next);
  }
  function addResource(si: number) {
    const next = [...steps];
    next[si].resources = [...next[si].resources, { title: "", url: "" }];
    setSteps(next);
  }
  function removeResource(si: number, ri: number) {
    const next = [...steps];
    next[si].resources = next[si].resources.filter((_, idx) => idx !== ri);
    setSteps(next);
  }
  function updateResource(si: number, ri: number, field: "title" | "url", value: string) {
    const next = [...steps];
    next[si].resources[ri][field] = value;
    setSteps(next);
  }

  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-[#1a1a1a] p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-gray-600 w-5 text-center">{i + 1}</span>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input
                value={step.title} onChange={e => updateStep(i, "title", e.target.value)}
                placeholder="Step title *"
                className="bg-[#111] border border-white/8 rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/40"
              />
              <input
                value={step.section} onChange={e => updateStep(i, "section", e.target.value)}
                placeholder="Section (e.g. Fundamentals)"
                className="bg-[#111] border border-white/8 rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/40"
              />
            </div>
            <button onClick={() => removeStep(i)} className="text-red-400/60 hover:text-red-400 transition-colors shrink-0"><X className="w-3.5 h-3.5" /></button>
          </div>
          <textarea
            value={step.description} onChange={e => updateStep(i, "description", e.target.value)}
            placeholder="Step description *"
            rows={2}
            className="w-full bg-[#111] border border-white/8 rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/40 resize-none mb-2 ml-7"
          />
          <div className="ml-7 space-y-1.5">
            {step.resources.map((res, ri) => (
              <div key={ri} className="flex gap-2 items-center">
                <input value={res.title} onChange={e => updateResource(i, ri, "title", e.target.value)} placeholder="Link title" className="flex-1 bg-[#111] border border-white/8 rounded-lg px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/30" />
                <input value={res.url} onChange={e => updateResource(i, ri, "url", e.target.value)} placeholder="https://..." className="flex-1 bg-[#111] border border-white/8 rounded-lg px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/30" />
                <button onClick={() => removeResource(i, ri)} className="text-red-400/50 hover:text-red-400 transition-colors shrink-0"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <button onClick={() => addResource(i)} className="text-[10px] text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add resource link
            </button>
          </div>
        </div>
      ))}
      <button onClick={addStep} className="w-full py-2 rounded-xl text-xs font-medium border border-dashed border-white/15 text-gray-500 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2">
        <Plus className="w-3.5 h-3.5" /> Add step
      </button>
    </div>
  );
}

// ── Create/Edit Roadmap Modal ───────────────────────────────────────────────
function RoadmapModal({ roadmap, onClose, onSave }: { roadmap?: any; onClose: () => void; onSave: (data: any) => void }) {
  const isEdit = !!roadmap;
  const [form, setForm] = useState({
    title: roadmap?.title ?? "",
    description: roadmap?.description ?? "",
    category: roadmap?.category ?? "Frontend",
    icon: roadmap?.icon ?? "terminal",
  });
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState<"info" | "steps">("info");

  async function handleSave() {
    setSaving(true);
    const stepsWithOrder = steps.map((s, i) => ({
      ...s,
      order: i + 1,
      resources: s.resources.filter(r => r.title && r.url),
    }));
    await onSave({ ...form, steps: stepsWithOrder });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="w-full max-w-xl rounded-2xl p-6 max-h-[90vh] flex flex-col"
        style={{ background: "#161616", border: "1px solid rgba(188,19,254,0.2)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Map className="w-4 h-4 text-[#bc13fe]" />
            {isEdit ? "Edit Roadmap" : "Create Roadmap"}
          </h2>
          <div className="flex items-center gap-2">
            {!isEdit && (
              <div className="flex rounded-lg border border-white/10 overflow-hidden">
                {(["info", "steps"] as const).map(p => (
                  <button key={p} onClick={() => setPhase(p)} className={cn("px-3 py-1 text-xs font-medium transition-colors", phase === p ? "bg-[#bc13fe]/20 text-[#bc13fe]" : "text-gray-500 hover:text-gray-300")}>
                    {p === "info" ? "Basic Info" : `Steps (${steps.length})`}
                  </button>
                ))}
              </div>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"><X className="w-3.5 h-3.5 text-gray-400" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
          {(phase === "info" || isEdit) && (
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#bc13fe]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Description *</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#bc13fe]/50 transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#bc13fe]/50 transition-colors">
                    {ROADMAP_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Icon</label>
                  <select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#bc13fe]/50 transition-colors">
                    {ICONS.map(ic => <option key={ic}>{ic}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
          {(!isEdit && phase === "steps") && (
            <StepBuilder steps={steps} setSteps={setSteps} />
          )}
        </div>

        <div className="shrink-0 pt-4 border-t border-white/8 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-white/5 border border-white/10 hover:border-white/20 transition-all">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title || !form.description}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "rgba(188,19,254,0.12)", border: "1px solid rgba(188,19,254,0.35)", color: "#bc13fe" }}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Roadmap"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Admin Component ────────────────────────────────────────────────────
export default function Admin() {
  const { user, isLoading: userLoading } = useUser();
  const qc = useQueryClient();

  useEffect(() => {
    document.title = "Admin — 4ever Rooted";
    return () => { document.title = "4ever Rooted — Developer Learning Platform"; };
  }, []);

  const [tab, setTab] = useState<Tab>("pending");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmType, setConfirmType] = useState<"resource" | "roadmap" | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [editResource, setEditResource] = useState<any | null>(null);
  const [createRoadmapOpen, setCreateRoadmapOpen] = useState(false);
  const [editRoadmap, setEditRoadmap] = useState<any | null>(null);
  const [fmhyState, setFmhyState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [fmhyResult, setFmhyResult] = useState<string>("");

  const { data: pending = [], isLoading: pendingLoading } = useQuery<any[]>({
    queryKey: ["admin-pending"],
    queryFn: async () => { const res = await fetch("/api/admin/resources/pending"); if (!res.ok) throw new Error("Forbidden"); return res.json(); },
    enabled: !userLoading && !!user && (user as any).isAdmin,
  });
  const { data: allResources = [], isLoading: resourcesLoading } = useQuery<any[]>({
    queryKey: ["admin-all-resources"],
    queryFn: async () => { const res = await fetch("/api/admin/resources/all"); if (!res.ok) throw new Error("Forbidden"); return res.json(); },
    enabled: !userLoading && !!user && (user as any).isAdmin,
  });
  const { data: roadmaps = [], isLoading: roadmapsLoading } = useQuery<any[]>({
    queryKey: ["roadmaps"],
    queryFn: async () => { const res = await fetch("/api/roadmaps"); if (!res.ok) throw new Error("Failed"); return res.json(); },
    enabled: !userLoading && !!user && (user as any).isAdmin,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-pending"] });
    qc.invalidateQueries({ queryKey: ["admin-all-resources"] });
    qc.invalidateQueries({ queryKey: ["roadmaps"] });
    qc.invalidateQueries({ queryKey: ["/api/stats"] });
  };

  const approveMutation = useMutation({
    mutationFn: async (id: number) => { const res = await fetch(`/api/admin/resources/${id}/approve`, { method: "PATCH" }); if (!res.ok) throw new Error("Failed"); },
    onSuccess: () => invalidate(),
  });
  const deleteResourceMutation = useMutation({
    mutationFn: async (id: number) => { const res = await fetch(`/api/admin/resources/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error("Failed"); },
    onSuccess: () => { invalidate(); setConfirmId(null); setConfirmType(null); setSelectedIds(new Set()); },
  });
  const deleteRoadmapMutation = useMutation({
    mutationFn: async (id: number) => { const res = await fetch(`/api/admin/roadmaps/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error("Failed"); },
    onSuccess: () => { invalidate(); setConfirmId(null); setConfirmType(null); },
  });
  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/admin/resources/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { invalidate(); setEditResource(null); },
  });
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, ids }: { action: "approve" | "delete"; ids: number[] }) => {
      const res = await fetch("/api/admin/resources/bulk-action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ids }) });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { invalidate(); setSelectedIds(new Set()); },
  });
  const createRoadmapMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/roadmaps", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { invalidate(); setCreateRoadmapOpen(false); },
  });
  const updateRoadmapMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/admin/roadmaps/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { invalidate(); setEditRoadmap(null); },
  });

  async function handleFmhySeed() {
    setFmhyState("loading");
    setFmhyResult("");
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 120_000);
      let res: Response;
      try {
        res = await fetch("/api/admin/seed-fmhy", { method: "POST", signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
      const text = await res.text();
      if (!text || !text.trim()) throw new Error("Server timed out or returned an empty response. The import may still be running — wait 30 seconds and refresh.");
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned unexpected response: ${text.slice(0, 200)}`);
      }
      if (!res.ok) throw new Error(data.message || "Import failed");
      setFmhyResult(data.message);
      setFmhyState("done");
      invalidate();
    } catch (err: any) {
      const msg = err.name === "AbortError"
        ? "Request timed out after 2 minutes. The import may still be running — check back in a moment."
        : (err.message || "Import failed");
      setFmhyResult(msg);
      setFmhyState("error");
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function selectAll() {
    setSelectedIds(prev => prev.size === pending.length ? new Set() : new Set(pending.map((r: any) => r.id)));
  }

  if (userLoading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  }
  if (!user || !(user as any).isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Navbar />
        <div className="h-16 shrink-0" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4 opacity-50" />
            <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-gray-500 text-sm">This area is restricted to administrators.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "pending", label: "Pending Review", icon: Clock, count: pending.length },
    { id: "resources", label: "All Resources", icon: BookOpen, count: allResources.length },
    { id: "roadmaps", label: "Roadmaps", icon: Map, count: roadmaps.length },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <div className="h-16 shrink-0" />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: "rgba(0,243,255,0.08)", borderColor: "rgba(0,243,255,0.2)" }}>
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Admin Panel</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage resources, roadmaps, and community submissions.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/8 mb-8 w-fit overflow-x-auto max-w-full">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => { setTab(id); setSelectedIds(new Set()); }}
              className={cn("flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap", tab === id ? "bg-[#1a1a1a] text-white border border-white/10 shadow" : "text-gray-500 hover:text-gray-300")}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {count !== undefined && count > 0 && (
                <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded-full", id === "pending" ? "bg-amber-500/15 text-amber-400 border border-amber-500/25" : "bg-white/8 text-gray-500")}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── PENDING TAB ── */}
        {tab === "pending" && (
          <>
            {pending.length > 0 && (
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <button onClick={selectAll} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                  <SquareCheckBig className="w-3.5 h-3.5" />
                  {selectedIds.size === pending.length ? "Deselect all" : "Select all"}
                </button>
                <AnimatePresence>
                  {selectedIds.size > 0 && (
                    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500 font-mono">{selectedIds.size} selected</span>
                      <button
                        onClick={() => bulkActionMutation.mutate({ action: "approve", ids: Array.from(selectedIds) })}
                        disabled={bulkActionMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40"
                        style={{ color: "#4ade80", background: "rgba(74,222,128,0.08)", borderColor: "rgba(74,222,128,0.25)" }}
                      >
                        <Check className="w-3 h-3" /> Approve {selectedIds.size}
                      </button>
                      <button
                        onClick={() => bulkActionMutation.mutate({ action: "delete", ids: Array.from(selectedIds) })}
                        disabled={bulkActionMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40"
                        style={{ color: "#f87171", background: "rgba(248,113,113,0.06)", borderColor: "rgba(248,113,113,0.2)" }}
                      >
                        <Trash2 className="w-3 h-3" /> Reject {selectedIds.size}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {pendingLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
            ) : pending.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border" style={{ background: "rgba(74,222,128,0.08)", borderColor: "rgba(74,222,128,0.2)" }}>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">All caught up!</h2>
                <p className="text-gray-500 text-sm">No pending resource submissions right now.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {(pending as any[]).map((r: any) => {
                    const tags: string[] = Array.isArray(r.tags) ? r.tags : [];
                    const isApproving = approveMutation.isPending && approveMutation.variables === r.id;
                    const isDeleting = deleteResourceMutation.isPending && deleteResourceMutation.variables === r.id;
                    const isSelected = selectedIds.has(r.id);
                    return (
                      <motion.div key={r.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
                        className={cn("rounded-2xl overflow-hidden border bg-[#141414] transition-colors", isSelected ? "border-primary/40" : "border-white/8")}>
                        <div className="h-[2px]" style={{ background: "linear-gradient(90deg, rgba(250,204,21,0.6), transparent)" }} />
                        <div className="p-4 sm:p-5">
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <button onClick={() => toggleSelect(r.id)} className={cn("mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all", isSelected ? "bg-primary border-primary" : "border-white/20 hover:border-primary/60")}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-black" />}
                            </button>

                            {/* Main content */}
                            <div className="flex-1 min-w-0">
                              {/* Title + meta row */}
                              <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                  <h3 className="text-sm sm:text-base font-bold text-white truncate">{r.title}</h3>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">pending</span>
                                </div>
                                {/* Submitter + date — right side, hidden on very small */}
                                <div className="hidden xs:flex sm:flex flex-col items-end gap-0.5 shrink-0">
                                  {r.submittedBy && <div className="flex items-center gap-1 text-[10px] text-gray-500"><User className="w-2.5 h-2.5" /><span className="font-mono">{r.submittedBy.slice(0, 10)}…</span></div>}
                                  {r.createdAt && <span className="text-[10px] text-gray-600 font-mono">{new Date(r.createdAt * 1000).toLocaleDateString()}</span>}
                                </div>
                              </div>

                              <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary/60 hover:text-primary transition-colors mb-2 font-mono">
                                {getDomain(r.url)} <ExternalLink className="w-2.5 h-2.5" />
                              </a>

                              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-3">{r.description}</p>

                              <div className="flex flex-wrap gap-1.5 items-center mb-3">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-gray-400">{r.category}{r.subcategory ? ` › ${r.subcategory}` : ""}</span>
                                {tags.slice(0, 4).map((t: string) => (
                                  <span key={t} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-gray-500"><Tag className="w-2 h-2" />{t}</span>
                                ))}
                              </div>

                              {/* Action row — always at bottom, responsive */}
                              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5 flex-wrap">
                                {/* Mobile: submitter info */}
                                <div className="flex items-center gap-3 text-[10px] text-gray-600 sm:hidden">
                                  {r.submittedBy && <span className="font-mono">{r.submittedBy.slice(0, 10)}…</span>}
                                  {r.createdAt && <span>{new Date(r.createdAt * 1000).toLocaleDateString()}</span>}
                                </div>
                                <div className="flex gap-2 ml-auto">
                                  <button onClick={() => { setConfirmId(r.id); setConfirmType("resource"); }} disabled={isDeleting || isApproving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40"
                                    style={{ color: "#f87171", background: "rgba(248,113,113,0.06)", borderColor: "rgba(248,113,113,0.2)" }}>
                                    {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />} Reject
                                  </button>
                                  <button onClick={() => approveMutation.mutate(r.id)} disabled={isApproving || isDeleting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40"
                                    style={{ color: "#4ade80", background: "rgba(74,222,128,0.08)", borderColor: "rgba(74,222,128,0.25)" }}>
                                    {isApproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Approve
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* ── ALL RESOURCES TAB ── */}
        {tab === "resources" && (
          <>
            {/* FMHY Import section */}
            <div className="mb-6 p-4 rounded-2xl border border-white/8 bg-white/3">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <Download className="w-4 h-4 text-primary" />
                    Import from FMHY
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Fetch 500–900 curated resources from the FMHY index. New categories (Entertainment, General Tools) will be populated. Duplicates are skipped automatically.
                  </p>
                  {fmhyResult && (
                    <p className={cn("text-xs mt-2 font-mono", fmhyState === "done" ? "text-emerald-400" : "text-red-400")}>
                      {fmhyResult}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleFmhySeed}
                  disabled={fmhyState === "loading"}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 shrink-0"
                  style={{ background: "rgba(0,243,255,0.08)", borderColor: "rgba(0,243,255,0.25)", color: "#00f3ff" }}
                >
                  {fmhyState === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  {fmhyState === "loading" ? "Importing…" : "Import FMHY"}
                </button>
              </div>
            </div>

            {resourcesLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
            ) : allResources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center"><Inbox className="w-10 h-10 text-gray-600 mb-3" /><p className="text-gray-500 text-sm">No approved resources yet.</p></div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {(allResources as any[]).map((r: any) => {
                    const isDeleting = deleteResourceMutation.isPending && deleteResourceMutation.variables === r.id;
                    return (
                      <motion.div key={r.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16, height: 0 }}
                        className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 rounded-xl border border-white/8 bg-[#141414] hover:border-white/12 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white truncate">{r.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-gray-500 shrink-0">{r.category}</span>
                          </div>
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-gray-600 hover:text-primary transition-colors font-mono mt-0.5">
                            {getDomain(r.url)} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => setEditResource(r)} className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all" style={{ color: "#00f3ff", background: "rgba(0,243,255,0.06)", borderColor: "rgba(0,243,255,0.15)" }}>
                            <Pencil className="w-3 h-3" /> <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button onClick={() => { setConfirmId(r.id); setConfirmType("resource"); }} disabled={isDeleting}
                            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40"
                            style={{ color: "#f87171", background: "rgba(248,113,113,0.06)", borderColor: "rgba(248,113,113,0.15)" }}>
                            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* ── ROADMAPS TAB ── */}
        {tab === "roadmaps" && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => setCreateRoadmapOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
                style={{ background: "rgba(188,19,254,0.1)", borderColor: "rgba(188,19,254,0.3)", color: "#bc13fe" }}>
                <Plus className="w-4 h-4" /> Create Roadmap
              </button>
            </div>
            {roadmapsLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
            ) : roadmaps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center"><Map className="w-10 h-10 text-gray-600 mb-3" /><p className="text-gray-500 text-sm">No roadmaps found.</p></div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {(roadmaps as any[]).map((rm: any) => {
                    const isDeleting = deleteRoadmapMutation.isPending && deleteRoadmapMutation.variables === rm.id;
                    return (
                      <motion.div key={rm.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16, height: 0 }}
                        className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 rounded-xl border border-white/8 bg-[#141414] hover:border-white/12 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white truncate">{rm.title}</span>
                            {rm.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#bc13fe]/10 border border-[#bc13fe]/20 text-[#bc13fe] shrink-0">{rm.category}</span>}
                          </div>
                          {rm.description && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{rm.description}</p>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => setEditRoadmap(rm)} className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all" style={{ color: "#bc13fe", background: "rgba(188,19,254,0.06)", borderColor: "rgba(188,19,254,0.2)" }}>
                            <Pencil className="w-3 h-3" /> <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button onClick={() => { setConfirmId(rm.id); setConfirmType("roadmap"); }} disabled={isDeleting}
                            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40"
                            style={{ color: "#f87171", background: "rgba(248,113,113,0.06)", borderColor: "rgba(248,113,113,0.15)" }}>
                            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmId !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
            onClick={() => { setConfirmId(null); setConfirmType(null); }}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: "#161616", border: "1px solid rgba(248,113,113,0.2)", boxShadow: "0 0 60px rgba(248,113,113,0.06)" }}
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)" }}>
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-center mb-2">Delete {confirmType === "roadmap" ? "Roadmap" : "Resource"}?</h3>
              <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed">
                This action is permanent and cannot be undone.
                {confirmType === "roadmap" && " All steps and progress for this roadmap will also be removed."}
              </p>
              <div className="flex gap-3">
                <button onClick={() => { setConfirmId(null); setConfirmType(null); }} className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-400 bg-white/5 border border-white/10 hover:border-white/20 transition-all">Cancel</button>
                <button
                  onClick={() => { if (confirmType === "resource") deleteResourceMutation.mutate(confirmId!); else deleteRoadmapMutation.mutate(confirmId!); }}
                  disabled={deleteResourceMutation.isPending || deleteRoadmapMutation.isPending}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 transition-all disabled:opacity-50">
                  {(deleteResourceMutation.isPending || deleteRoadmapMutation.isPending) ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Resource Modal */}
      <AnimatePresence>
        {editResource && (
          <EditResourceModal
            resource={editResource}
            onClose={() => setEditResource(null)}
            onSave={(data) => updateResourceMutation.mutateAsync({ id: editResource.id, data })}
          />
        )}
      </AnimatePresence>

      {/* Create Roadmap Modal */}
      <AnimatePresence>
        {createRoadmapOpen && (
          <RoadmapModal
            onClose={() => setCreateRoadmapOpen(false)}
            onSave={(data) => createRoadmapMutation.mutateAsync(data)}
          />
        )}
      </AnimatePresence>

      {/* Edit Roadmap Modal */}
      <AnimatePresence>
        {editRoadmap && (
          <RoadmapModal
            roadmap={editRoadmap}
            onClose={() => setEditRoadmap(null)}
            onSave={(data) => updateRoadmapMutation.mutateAsync({ id: editRoadmap.id, data })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
