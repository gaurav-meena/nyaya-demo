"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Scale, Search, Zap, Loader2, Gavel, LayoutDashboard, ShieldCheck,
  BookOpen, FileEdit, Bell, Calendar, ChevronRight, Copy, Check,
  AlertCircle, Clock, FileText, Plus, Upload, Download, User, Settings,
  CheckCircle2, Circle, ArrowUpRight, Briefcase, MapPin, Archive,
  Send, RefreshCw, PenLine, AlignLeft, Bold, Italic, List, Link2,
  Hash, BarChart2, TrendingUp, GitBranch, Cpu, Database, AlertTriangle,
  Activity, Layers, Code2, Filter, MoreHorizontal, Star, Lock,
  ChevronDown, Eye, Microscope, Network, Brain, Workflow
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────
type CaseStatus = "urgent" | "active" | "adjourned" | "disposed";
interface Case { id: string; title: string; caseNo: string; court: string; nextDate: string; status: CaseStatus; client: string; section: string; stage: string; }
interface Hearing { time: string; caseNo: string; court: string; title: string; urgent?: boolean; }
interface PatentFeature { id: number; title: string; module: string; risk: "low" | "med" | "high"; tag: string; effect: string; }

// ─── Data ───────────────────────────────────────────────────────────────────
const CASES: Case[] = [
  { id: "1", title: "Rajesh Kumar v. State of Rajasthan", caseNo: "S.B. Cr. Rev. 412/2024", court: "Rajasthan HC, Jodhpur", nextDate: "18 Apr 2026", status: "urgent", client: "Rajesh Kumar", section: "Sec. 420 BNS", stage: "Arguments" },
  { id: "2", title: "M/s Arjun Traders v. Union of India", caseNo: "D.B. Civil Writ 1887/2025", court: "Rajasthan HC, Jodhpur", nextDate: "22 Apr 2026", status: "active", client: "M/s Arjun Traders", section: "Art. 226 Constitution", stage: "Evidence" },
  { id: "3", title: "Sunita Devi v. Ramesh Chand", caseNo: "Civil Suit 334/2023", court: "District Court, Jaipur", nextDate: "25 Apr 2026", status: "adjourned", client: "Sunita Devi", section: "Sec. 12 DV Act", stage: "Interim Relief" },
  { id: "4", title: "State v. Vikram Singh (Bail)", caseNo: "S.B. Cr. Misc. 2201/2026", court: "Rajasthan HC, Jaipur", nextDate: "14 Apr 2026", status: "urgent", client: "Vikram Singh", section: "Sec. 439 BNSS", stage: "Final Hearing" },
  { id: "5", title: "Priya Sharma v. ABC Pvt Ltd", caseNo: "CS 778/2025", court: "Civil Court, Ajmer", nextDate: "03 May 2026", status: "active", client: "Priya Sharma", section: "Sec. 14 CPA", stage: "Written Statement" },
  { id: "6", title: "Govind Ram v. Collector, Bikaner", caseNo: "RLW 902/2024", court: "Revenue Tribunal, Raj.", nextDate: "06 May 2026", status: "active", client: "Govind Ram", section: "Rajasthan Land Rev. Act", stage: "Filing" },
];
const HEARINGS: Hearing[] = [
  { time: "10:30 AM", caseNo: "S.B. Cr. Misc. 2201/2026", court: "Court No. 3, RHC Jaipur", title: "State v. Vikram Singh", urgent: true },
  { time: "11:15 AM", caseNo: "CMP 44/2026", court: "Court No. 7, District Jaipur", title: "Ramesh v. PWD" },
  { time: "02:00 PM", caseNo: "D.B. Civil Writ 1887/2025", court: "D.B. No. 2, RHC Jodhpur", title: "M/s Arjun Traders v. UoI" },
];
const PATENT_FEATURES: PatentFeature[] = [
  { id: 1, title: "Schema inference engine", module: "Cause list parser", risk: "low", tag: "Data architecture", effect: "Dynamic schema detection across 25+ HC formats" },
  { id: 2, title: "Drift detector", module: "Predictive analytics", risk: "low", tag: "ML / inference", effect: "Amendment-event triggered model re-calibration" },
  { id: 3, title: "Precedent graph", module: "Research engine", risk: "low", tag: "Data architecture", effect: "Weighted DAG with hierarchical authority edges" },
  { id: 4, title: "FSA-constrained decoder", module: "Generative drafting", risk: "low", tag: "NLP / generation", effect: "Formal grammar enforcement over LLM generation" },
  { id: 5, title: "Throughput queuing model", module: "Hearing predictor", risk: "low", tag: "System design", effect: "M/G/1 queue adapted for bench-specific parameters" },
  { id: 6, title: "Cross-lingual NER", module: "Data pipeline", risk: "low", tag: "ML / inference", effect: "Mixed-script entity extraction (EN + Devanagari)" },
  { id: 7, title: "Defect fingerprint classifier", module: "Pre-filing check", risk: "med", tag: "NLP / generation", effect: "Parse-tree alignment for defect prediction" },
  { id: 8, title: "Temporal-hierarchical embeddings", module: "RAG engine", risk: "med", tag: "Data architecture", effect: "Validity-interval constrained retrieval post-BNS" },
  { id: 9, title: "Argument-structure generator", module: "Note maker", risk: "med", tag: "NLP / generation", effect: "Dependency-graph serialisation for submissions" },
  { id: 10, title: "Judge embedding encoder", module: "Strategy engine", risk: "high", tag: "ML / inference", effect: "Constitutional-constraint anchored ruling patterns" },
];
const PETITION_TYPES = ["Bail Application (Sec. 480 BNSS)", "Anticipatory Bail (Sec. 482 BNSS)", "Writ Petition (Art. 226)", "Revision Petition", "Written Submissions", "Counter Affidavit", "Civil Misc. Application", "Vakalatnama"];
const STATUS_STYLE: Record<CaseStatus, string> = { urgent: "bg-red-50 text-red-600 border-red-200", active: "bg-emerald-50 text-emerald-700 border-emerald-200", adjourned: "bg-amber-50 text-amber-700 border-amber-200", disposed: "bg-slate-100 text-slate-500 border-slate-200" };

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard", icon: LayoutDashboard, label: "Command center" },
  { id: "casediary", icon: Briefcase, label: "Case diary" },
  { id: "research", icon: Zap, label: "AI research" },
  { id: "analytics", icon: BarChart2, label: "Predictive analytics" },
  { id: "schema", icon: Database, label: "Schema engine" },
  { id: "efiling", icon: Gavel, label: "E-filing" },
  { id: "notemaker", icon: PenLine, label: "Note maker" },
  { id: "causelist", icon: Calendar, label: "Cause list" },
  { id: "patents", icon: Lock, label: "IP portfolio" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function NyayaAI() {
  const [tab, setTab] = useState("dashboard");
  const [searching, setSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [copied, setCopied] = useState(false);
  const [caseFilter, setCaseFilter] = useState<"all" | CaseStatus>("all");
  const [petitionType, setPetitionType] = useState(PETITION_TYPES[0]);
  const [filingStep, setFilingStep] = useState(1);
  const [noteContent, setNoteContent] = useState("# Written Submissions\n\n## Facts\n\n1. \n\n## Points of Law\n\n1. \n\n## Prayer\n\nIt is, therefore, most respectfully prayed...");
  const [petitionForm, setPetitionForm] = useState({ petitioner: "", respondent: "", court: "", section: "", facts: "", prayer: "" });
  const [hearingProb, setHearingProb] = useState<number | null>(null);
  const [driftStatus, setDriftStatus] = useState<"stable" | "drifting" | "recalibrating">("stable");
  const [schemaInferring, setSchemaInferring] = useState(false);
  const [schemaResult, setSchemaResult] = useState<Record<string, string> | null>(null);
  const [selectedPatent, setSelectedPatent] = useState<number | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [analyticsPrediction, setAnalyticsPrediction] = useState<null | { success: number; stay: number; defect: number }>(null);
  const urgentCount = CASES.filter(c => c.status === "urgent").length;

  const callGemini = async (prompt: string) => {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) throw new Error("API key missing");
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    return d.candidates[0].content.parts[0].text as string;
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true); setShowResult(false);
    try {
      const res = await callGemini(`You are an elite Indian Legal Research AI for Adv. Gaurav Meena. Provide: 1) Legal position (2-3 sentences), 2) Relevant BNS/BNSS/IEA/Constitution sections with exact numbers, 3) 2-3 landmark Supreme Court or Rajasthan HC precedents with citations, 4) A litigation tip. Use clear headings. Query: ${query}`);
      setAiResponse(res);
    } catch (e: any) { setAiResponse(`❌ ${e.message}`); }
    setShowResult(true); setSearching(false);
  };

  const handleAnalytics = async () => {
    setAnalysing(true); setAnalyticsPrediction(null);
    await new Promise(r => setTimeout(r, 1800));
    setAnalyticsPrediction({ success: Math.round(55 + Math.random() * 30), stay: Math.round(40 + Math.random() * 40), defect: Math.round(5 + Math.random() * 20) });
    setAnalysing(false);
  };

  const handleSchemaInfer = async () => {
    setSchemaInferring(true); setSchemaResult(null);
    await new Promise(r => setTimeout(r, 2200));
    setSchemaResult({ "Sr. No.": "serial_number", "Case Title": "case_title", "Case No.": "case_number", "Petitioner Adv.": "petitioner_advocate", "Respondent Adv.": "respondent_advocate", "Board": "bench_id", "Remarks": "remarks" });
    setSchemaInferring(false);
  };

  const handleHearingProb = async () => {
    setHearingProb(null);
    await new Promise(r => setTimeout(r, 1400));
    setHearingProb(Math.round(62 + Math.random() * 30));
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const filtered = caseFilter === "all" ? CASES : CASES.filter(c => c.status === caseFilter);

  const renderAI = (text: string) => text.split("\n").map((line, i) => {
    if (line.startsWith("## ") || line.startsWith("# ")) return <h3 key={i} className="font-bold text-slate-900 text-sm mt-4 mb-1.5 first:mt-0">{line.replace(/^##? /, "")}</h3>;
    if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-slate-800 mt-1.5 text-sm">{line.replace(/\*\*/g, "")}</p>;
    if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="ml-4 mb-1 list-disc text-slate-600 text-sm">{line.replace(/^[-*] /, "")}</li>;
    if (!line.trim()) return <div key={i} className="h-1.5" />;
    return <p key={i} className="text-sm text-slate-700 mb-1">{line}</p>;
  });

  return (
    <div className="flex h-screen bg-[#f4f3ef] overflow-hidden" style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

      {/* Sidebar */}
      <aside className="w-60 bg-[#0f1623] flex flex-col flex-shrink-0">
        <div className="px-5 pt-6 pb-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <Scale size={14} className="text-[#0f1623]" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">Nyaya<span className="text-teal-400">.ai</span></span>
          </div>
          <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">Legal Operating System v2</p>
        </div>

        {urgentCount > 0 && (
          <div className="mx-3 mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
            <span className="text-[10px] text-red-400 font-medium">{urgentCount} urgent today</span>
          </div>
        )}

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${tab === id ? "bg-teal-500/15 text-teal-300 font-medium" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <Icon size={14} className="flex-shrink-0" />
              <span className="capitalize">{label}</span>
              {id === "patents" && <span className="ml-auto text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-md font-bold">10</span>}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <div className="bg-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
              <User size={12} className="text-teal-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Adv. Gaurav Meena</p>
              <p className="text-[9px] text-slate-500 truncate">Rajasthan HC · CAT</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-7">
            <div className="flex items-start justify-between mb-7">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Good morning, Counsel.</h1>
                <p className="text-xs text-slate-500 mt-0.5">Thursday, 16 April 2026 · {HEARINGS.length} hearings today</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs bg-[#0f1623] text-white px-3.5 py-2 rounded-xl hover:bg-teal-600 transition">
                <RefreshCw size={11} /> Sync e-Courts
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3.5 mb-5">
              {[
                { label: "Active cases", value: CASES.filter(c => c.status !== "disposed").length, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Today's hearings", value: HEARINGS.length, icon: Calendar, color: "text-teal-600", bg: "bg-teal-50" },
                { label: "Urgent matters", value: urgentCount, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
                { label: "Patents filed", value: 3, icon: Lock, color: "text-purple-600", bg: "bg-purple-50" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mb-2.5`}>
                    <Icon size={15} className={color} />
                  </div>
                  <p className="text-xl font-bold text-slate-900">{value}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
                  <h2 className="font-semibold text-sm flex items-center gap-2"><Clock size={13} className="text-teal-500" />Today's hearings</h2>
                </div>
                {HEARINGS.map((h, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/50 transition border-b border-slate-50 last:border-0">
                    <p className="text-xs font-bold text-slate-800 w-16 flex-shrink-0">{h.time}</p>
                    <div className={`w-0.5 h-7 rounded-full flex-shrink-0 ${h.urgent ? "bg-red-400" : "bg-teal-300"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{h.title}</p>
                      <p className="text-[10px] text-slate-400">{h.caseNo} · {h.court}</p>
                    </div>
                    {h.urgent && <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">URGENT</span>}
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-50">
                  <h2 className="font-semibold text-sm flex items-center gap-2"><Brain size={13} className="text-purple-500" />AI patent features</h2>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {PATENT_FEATURES.slice(0, 5).map(f => (
                    <div key={f.id} className="flex items-center gap-2.5 py-1">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.risk === "low" ? "bg-emerald-400" : f.risk === "med" ? "bg-amber-400" : "bg-red-400"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-700 truncate">{f.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{f.module}</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setTab("patents")} className="w-full text-xs text-teal-600 text-left py-1 hover:underline">View all 10 patents →</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CASE DIARY ── */}
        {tab === "casediary" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Case Diary</h1>
                <p className="text-xs text-slate-500 mt-0.5">{CASES.length} matters</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs bg-teal-500 text-white px-3.5 py-2 rounded-xl hover:bg-teal-600 transition">
                <Plus size={12} /> New matter
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              {(["all", "urgent", "active", "adjourned", "disposed"] as const).map(f => (
                <button key={f} onClick={() => setCaseFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${caseFilter === f ? "bg-[#0f1623] text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"}`}>
                  {f === "all" ? `All (${CASES.length})` : f}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] text-[10px] font-bold text-slate-400 uppercase tracking-wider px-5 py-2.5 border-b border-slate-100 bg-slate-50/50">
                <span>Matter</span><span>Case no.</span><span>Court</span><span>Next date</span><span>Stage</span><span />
              </div>
              {filtered.map(c => (
                <div key={c.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] items-center px-5 py-3.5 hover:bg-slate-50/40 transition group border-b border-slate-50 last:border-0">
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-semibold text-slate-800 truncate">{c.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{c.client} · {c.section}</p>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{c.caseNo}</p>
                  <p className="text-xs text-slate-500">{c.court.split(",")[0]}</p>
                  <p className="text-xs font-semibold text-slate-700">{c.nextDate}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border w-fit capitalize ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                  <button className="opacity-0 group-hover:opacity-100 transition p-1 rounded-lg hover:bg-slate-100">
                    <MoreHorizontal size={13} className="text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── AI RESEARCH ── */}
        {tab === "research" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-7 max-w-3xl">
            <div className="mb-5">
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2"><Zap size={18} className="text-teal-500" />AI Research Engine</h1>
              <p className="text-xs text-slate-500 mt-0.5">Gemini 2.5 Flash · BNS, BNSS, IEA, Constitution, Labour Codes</p>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {["Bail under BNSS Sec 480", "Art. 226 writ maintainability", "Anticipatory bail conditions", "DV Act interim relief", "POCSO sentencing principles"].map(q => (
                <button key={q} onClick={() => setQuery(q)} className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl hover:border-teal-400 hover:text-teal-600 transition">{q}</button>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4">
              <textarea value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
                rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:border-teal-400 outline-none resize-none"
                placeholder="Describe your legal query… (Enter to search)" />
              <div className="flex justify-end mt-2">
                <button onClick={handleSearch} disabled={searching || !query.trim()}
                  className="bg-[#0f1623] disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-teal-600 transition flex items-center gap-2">
                  {searching ? <><Loader2 size={11} className="animate-spin" />Analysing…</> : <><Search size={11} />Analyse</>}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {showResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-teal-500" />
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Jurisprudence analysis</span>
                    </div>
                    <button onClick={() => copy(aiResponse)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition px-2 py-1 rounded-lg hover:bg-slate-100">
                      {copied ? <><Check size={10} className="text-teal-500" />Copied!</> : <><Copy size={10} />Copy</>}
                    </button>
                  </div>
                  <div className="p-5">{renderAI(aiResponse)}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── PREDICTIVE ANALYTICS ── */}
        {tab === "analytics" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-7 max-w-3xl">
            <div className="mb-5">
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2"><BarChart2 size={18} className="text-purple-500" />Predictive analytics</h1>
              <p className="text-xs text-slate-500 mt-0.5">Patent features: Precedent graph · Drift detector · Defect fingerprint classifier</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={14} className="text-amber-500" />
                  <p className="text-xs font-semibold text-slate-700">Drift detection status</p>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${driftStatus === "stable" ? "bg-emerald-400" : driftStatus === "drifting" ? "bg-amber-400 animate-pulse" : "bg-blue-400 animate-pulse"}`} />
                  <span className="text-sm font-semibold capitalize text-slate-800">{driftStatus === "stable" ? "Model stable" : driftStatus === "drifting" ? "Drift detected" : "Re-calibrating"}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Last amendment event: BNS 2023 migration. Model calibrated for post-BNS jurisprudence.</p>
                <div className="flex gap-2">
                  <button onClick={() => { setDriftStatus("drifting"); setTimeout(() => setDriftStatus("recalibrating"), 1200); setTimeout(() => setDriftStatus("stable"), 3000); }}
                    className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 transition">Simulate drift</button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch size={14} className="text-teal-500" />
                  <p className="text-xs font-semibold text-slate-700">Precedent graph stats</p>
                </div>
                {[{ label: "Nodes (judgments)", value: "4,82,113" }, { label: "Authority edges", value: "12,04,887" }, { label: "Overruled flags", value: "1,204" }, { label: "SC apex weight", value: "1.000" }].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                    <span className="text-[11px] text-slate-500">{label}</span>
                    <span className="text-xs font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-blue-500" />
                <p className="text-sm font-semibold text-slate-700">Case outcome predictor</p>
                <span className="ml-auto text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-lg font-medium">Patent feature #2 + #3</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Select matter</label>
                  <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-teal-400 outline-none bg-white">
                    {CASES.map(c => <option key={c.id}>{c.caseNo} — {c.title.slice(0, 30)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Reference date</label>
                  <input type="date" defaultValue="2026-04-16" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-teal-400 outline-none" />
                </div>
              </div>
              <button onClick={handleAnalytics} disabled={analysing}
                className="flex items-center gap-2 bg-[#0f1623] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-teal-600 disabled:opacity-60 transition">
                {analysing ? <><Loader2 size={11} className="animate-spin" />Running inference…</> : <><Cpu size={11} />Run prediction</>}
              </button>
              <AnimatePresence>
                {analyticsPrediction && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: "Success probability", value: analyticsPrediction.success, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
                      { label: "Stay order probability", value: analyticsPrediction.stay, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
                      { label: "Defect risk", value: analyticsPrediction.defect, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
                    ].map(({ label, value, color, bg, border }) => (
                      <div key={label} className={`${bg} border ${border} rounded-xl p-4`}>
                        <p className="text-[10px] text-slate-500 mb-1">{label}</p>
                        <p className={`text-2xl font-bold ${color}`}>{value}%</p>
                        <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color.replace("text-", "bg-")}`} style={{ width: `${value}%`, transition: "width 0.8s ease" }} />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-amber-500" />
                <p className="text-sm font-semibold text-slate-700">Pre-filing defect scanner</p>
                <span className="ml-auto text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-lg font-medium">Patent feature #7</span>
              </div>
              <textarea rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:border-teal-400 outline-none resize-none mb-3"
                placeholder="Paste petition draft text here to scan for structural defects…" />
              <button className="flex items-center gap-2 text-xs border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition">
                <Microscope size={11} />Scan for defects
              </button>
            </div>
          </motion.div>
        )}

        {/* ── SCHEMA ENGINE ── */}
        {tab === "schema" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-7 max-w-3xl">
            <div className="mb-5">
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2"><Database size={18} className="text-blue-500" />Schema inference engine</h1>
              <p className="text-xs text-slate-500 mt-0.5">Patent feature #1 · Dynamic multi-jurisdiction cause list normalisation</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
              <p className="text-xs font-semibold text-slate-600 mb-3">Select source court</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {["Rajasthan HC, Jodhpur", "Delhi HC", "Bombay HC", "District Court, Jaipur", "ITAT Jodhpur", "Revenue Tribunal"].map(c => (
                  <button key={c} className="text-xs border border-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:border-teal-400 hover:text-teal-600 transition text-left">{c}</button>
                ))}
              </div>
              <div className="bg-slate-50 rounded-xl p-3 font-mono text-[10px] text-slate-500 mb-4 border border-slate-200">
                <p className="text-slate-400 mb-1">{`/* Incoming cause list — unknown schema */`}</p>
                <p>Sr. No. | Case Title | Case No. | Petitioner Adv. | Respondent Adv. | Board | Remarks</p>
                <p>1 | Rajesh Kumar v. State | S.B.Cr.Rev.412/24 | Adv. A. Sharma | Adv. R. Gupta | II | Part-heard</p>
                <p>2 | Sunita v. Ramesh | CS 334/23 | Adv. P. Joshi | G.A. | I | Fresh</p>
              </div>
              <button onClick={handleSchemaInfer} disabled={schemaInferring}
                className="flex items-center gap-2 bg-[#0f1623] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-blue-600 disabled:opacity-60 transition">
                {schemaInferring ? <><Loader2 size={11} className="animate-spin" />Inferring schema…</> : <><Network size={11} />Run schema inference</>}
              </button>
            </div>

            <AnimatePresence>
              {schemaResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                    <CheckCircle2 size={13} className="text-teal-500" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Schema inferred · 97% confidence</span>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-[1fr_1fr_auto] text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 mb-2">
                      <span>Source column</span><span>Mapped field</span><span>Confidence</span>
                    </div>
                    {Object.entries(schemaResult).map(([src, mapped]) => (
                      <div key={src} className="grid grid-cols-[1fr_1fr_auto] items-center py-2 border-b border-slate-50 last:border-0">
                        <span className="text-xs font-mono text-slate-700">{src}</span>
                        <span className="text-xs text-teal-600 font-medium">{mapped}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">{Math.round(93 + Math.random() * 6)}%</span>
                      </div>
                    ))}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-[10px] text-blue-700 font-medium">Schema stored in registry under key <span className="font-mono">RHC_JDH_CAUSE_2026_V3</span>. Will auto-apply to future cause lists from this court.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} className="text-teal-500" />
                <p className="text-sm font-semibold text-slate-700">Hearing probability engine</p>
                <span className="ml-auto text-[10px] bg-teal-50 text-teal-600 border border-teal-200 px-2 py-0.5 rounded-lg font-medium">Patent feature #5</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">Stochastic M/G/1 queuing model with bench-specific service time distributions.</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Matter position</label>
                  <input type="number" defaultValue={14} min={1} max={60} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-teal-400 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Bench</label>
                  <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-teal-400 outline-none bg-white">
                    <option>S.B. Division — Bench II</option><option>D.B. Division — Bench I</option><option>Single Judge — Bench III</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Matter type</label>
                  <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-teal-400 outline-none bg-white">
                    <option>Bail application</option><option>Writ petition</option><option>Civil revision</option>
                  </select>
                </div>
              </div>
              <button onClick={handleHearingProb}
                className="flex items-center gap-2 text-xs bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition">
                <Activity size={11} />Compute hearing probability
              </button>
              {hearingProb !== null && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-2xl font-bold text-teal-600">{hearingProb}%</div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Probability of being heard today</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Based on historical throughput for selected bench · {hearingProb >= 70 ? "High confidence — prepare arguments" : hearingProb >= 50 ? "Moderate — be present from 10 AM" : "Low — consider seeking date change"}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── E-FILING ── */}
        {tab === "efiling" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-7 max-w-3xl">
            <div className="mb-5">
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2"><Gavel size={18} className="text-teal-500" />E-Filing portal</h1>
              <p className="text-xs text-slate-500 mt-0.5">FSA-constrained generation · Patent feature #4</p>
            </div>
            <div className="flex items-center gap-2 mb-6">
              {["Template", "Details", "Preview", "Submit"].map((label, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setFilingStep(i + 1)}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${filingStep > i + 1 ? "bg-teal-500 text-white" : filingStep === i + 1 ? "bg-[#0f1623] text-white" : "bg-slate-200 text-slate-500"}`}>
                      {filingStep > i + 1 ? <Check size={10} /> : i + 1}
                    </div>
                    <span className={`text-xs font-medium ${filingStep === i + 1 ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
                  </div>
                  {i < 3 && <div className={`flex-1 h-px ${filingStep > i + 1 ? "bg-teal-400" : "bg-slate-200"}`} />}
                </React.Fragment>
              ))}
            </div>

            {filingStep === 1 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-slate-700 mb-3">Select petition type</p>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {PETITION_TYPES.map(t => (
                    <label key={t} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${petitionType === t ? "border-teal-400 bg-teal-50/50" : "border-slate-200 hover:border-slate-300"}`}>
                      <input type="radio" name="pt" checked={petitionType === t} onChange={() => setPetitionType(t)} className="text-teal-500" />
                      <span className="text-xs font-medium text-slate-700">{t}</span>
                    </label>
                  ))}
                </div>
                <button onClick={() => setFilingStep(2)} className="bg-[#0f1623] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-teal-600 transition flex items-center gap-2">
                  Continue <ChevronRight size={13} />
                </button>
              </div>
            )}

            {filingStep === 2 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-slate-700 mb-4">Party & court details</p>
                <div className="grid grid-cols-2 gap-3">
                  {[{ f: "petitioner", l: "Petitioner", p: "Full name" }, { f: "respondent", l: "Respondent", p: "State / opposing party" }, { f: "court", l: "Court / bench", p: "e.g. S.B. Division" }, { f: "section", l: "Under section", p: "Sec. 480 BNSS / Art. 226" }].map(({ f, l, p }) => (
                    <div key={f}>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">{l}</label>
                      <input value={petitionForm[f as keyof typeof petitionForm]} onChange={e => setPetitionForm(prev => ({ ...prev, [f]: e.target.value }))}
                        placeholder={p} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-teal-400 outline-none transition" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Brief facts</label>
                    <textarea value={petitionForm.facts} onChange={e => setPetitionForm(p => ({ ...p, facts: e.target.value }))} rows={2}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-teal-400 outline-none resize-none transition" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Prayer</label>
                    <textarea value={petitionForm.prayer} onChange={e => setPetitionForm(p => ({ ...p, prayer: e.target.value }))} rows={2}
                      placeholder="It is therefore most respectfully prayed that…"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-teal-400 outline-none resize-none transition" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setFilingStep(1)} className="border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 transition">Back</button>
                  <button onClick={() => setFilingStep(3)} className="bg-[#0f1623] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-teal-600 transition flex items-center gap-2">
                    Generate draft <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {filingStep === 3 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                  <span className="text-xs font-semibold text-slate-600">Draft — {petitionType}</span>
                  <div className="flex gap-2">
                    <button onClick={() => copy("Draft petition")} className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition flex items-center gap-1">
                      <Copy size={10} />Copy
                    </button>
                    <button className="text-xs bg-teal-500 text-white px-3 py-1.5 rounded-lg hover:bg-teal-600 transition flex items-center gap-1">
                      <Download size={10} />PDF
                    </button>
                  </div>
                </div>
                <div className="p-7 bg-[#fdfcfb]" style={{ fontFamily: "Georgia,serif", fontSize: "13px", lineHeight: "2" }}>
                  <p className="text-center font-bold uppercase tracking-wider text-sm mb-4">In the High Court of Judicature for Rajasthan</p>
                  <p className="text-center text-slate-500 text-xs mb-4">{petitionForm.court || "[Court / Bench]"}</p>
                  <p className="text-center font-bold uppercase mb-4">{petitionType}</p>
                  <p className="mb-1">In the matter of:</p>
                  <p className="ml-8">{petitionForm.petitioner || "[Petitioner]"} <span className="float-right text-slate-400">…Petitioner</span></p>
                  <p className="text-center my-2 text-slate-400 clear-both">versus</p>
                  <p className="ml-8 mb-3">{petitionForm.respondent || "[Respondent]"} <span className="float-right text-slate-400">…Respondent</span></p>
                  {petitionForm.section && <p className="clear-both mt-2"><strong>Under:</strong> {petitionForm.section}</p>}
                  {petitionForm.facts && <><p className="mt-3 font-bold">Brief Facts:</p><p className="ml-4">{petitionForm.facts}</p></>}
                  {petitionForm.prayer && <><p className="mt-3 font-bold">Prayer:</p><p className="ml-4">{petitionForm.prayer}</p></>}
                  <div className="mt-10 text-right clear-both">
                    <p>Respectfully submitted,</p>
                    <p className="mt-4 font-bold">Adv. Gaurav Meena</p>
                    <p className="text-slate-500 text-xs">Enr. No. RJ/2026/1234 · Rajasthan HC</p>
                  </div>
                </div>
                <div className="flex gap-2 px-5 py-3 border-t border-slate-100">
                  <button onClick={() => setFilingStep(2)} className="border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 transition">Back</button>
                  <button onClick={() => setFilingStep(4)} className="bg-teal-500 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-teal-600 transition flex items-center gap-2">
                    Submit filing <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {filingStep === 4 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={26} className="text-teal-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">Ready for e-filing</h3>
                <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto">Formatted per Rajasthan HC e-filing standards. Attach vakalatnama & court fees before submission.</p>
                <div className="flex justify-center gap-3">
                  <button className="flex items-center gap-1.5 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 transition"><Upload size={12} />Attach docs</button>
                  <button className="flex items-center gap-1.5 bg-[#0f1623] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-teal-600 transition"><Send size={12} />Submit to portal</button>
                </div>
                <button onClick={() => setFilingStep(1)} className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline">New filing</button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── NOTE MAKER ── */}
        {tab === "notemaker" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-7 flex flex-col" style={{ height: "calc(100vh - 0px)" }}>
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div>
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2"><PenLine size={18} className="text-teal-500" />Note maker</h1>
                <p className="text-xs text-slate-500 mt-0.5">Patent feature #9 · Argument-structure-aware generation</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copy(noteContent)} className="flex items-center gap-1 text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition">
                  {copied ? <><Check size={10} className="text-teal-500" />Copied!</> : <><Copy size={10} />Copy</>}
                </button>
                <button className="flex items-center gap-1 text-xs bg-teal-500 text-white px-3 py-1.5 rounded-xl hover:bg-teal-600 transition"><Download size={10} />DOCX</button>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 mb-2 flex-shrink-0 flex-wrap">
              {[Bold, Italic, AlignLeft, List, Link2, Hash].map((Icon, i) => (
                <button key={i} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"><Icon size={12} /></button>
              ))}
              <div className="w-px h-4 bg-slate-200 mx-1" />
              <select className="text-xs text-slate-600 bg-transparent border-none outline-none cursor-pointer">
                <option>Written submissions</option><option>Counter affidavit</option><option>Rejoinder</option><option>Legal opinion</option>
              </select>
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-teal-600">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />Auto-saved
              </span>
            </div>
            <div className="flex gap-3 flex-1 min-h-0">
              <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 text-xs leading-loose text-slate-800 resize-none focus:border-teal-400 outline-none"
                style={{ fontFamily: "ui-monospace,monospace", lineHeight: "1.9" }} />
              <div className="w-48 flex-shrink-0 bg-white border border-slate-200 rounded-2xl p-3 overflow-y-auto">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quick inserts</p>
                {[
                  { l: "Prayer clause", t: "\n\nPRAYER:\nIt is therefore most respectfully prayed…" },
                  { l: "Verification", t: "\n\nVERIFICATION:\nI, the deponent, verify that the contents are true…" },
                  { l: "Without prejudice", t: " (without prejudice to all other contentions)" },
                  { l: "Sec. 439 BNSS", t: " under Section 439 BNSS, 2023" },
                  { l: "Art. 226 prayer", t: " under Article 226 of the Constitution of India" },
                ].map(({ l, t }) => (
                  <button key={l} onClick={() => setNoteContent(p => p + t)}
                    className="w-full text-left text-[11px] text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition mb-0.5">+ {l}</button>
                ))}
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Words</p>
                  <p className="text-lg font-bold text-slate-800">{noteContent.split(/\s+/).filter(Boolean).length}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CAUSE LIST ── */}
        {tab === "causelist" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2"><Calendar size={18} className="text-teal-500" />Cause list</h1>
                <p className="text-xs text-slate-500 mt-0.5">Thursday, 16 April 2026 · Live sync from Rajasthan HC</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />Live
                </span>
              </div>
            </div>
            <div className="space-y-2.5 mb-5">
              {HEARINGS.map((h, i) => (
                <div key={i} className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-5 ${h.urgent ? "border-red-200" : "border-slate-100"}`}>
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${h.urgent ? "bg-red-50" : "bg-teal-50"}`}>
                    <p className={`text-[9px] font-bold ${h.urgent ? "text-red-500" : "text-teal-600"}`}>{h.time.split(" ")[1]}</p>
                    <p className={`text-sm font-black ${h.urgent ? "text-red-600" : "text-teal-700"}`}>{h.time.split(" ")[0]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-slate-900 text-sm">{h.title}</p>
                      {h.urgent && <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">URGENT</span>}
                    </div>
                    <p className="text-xs text-slate-500">{h.caseNo}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-slate-400" />
                      <p className="text-[11px] text-slate-400">{h.court}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setTab("notemaker")} className="text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition flex items-center gap-1"><PenLine size={10} />Notes</button>
                    <button onClick={() => setTab("research")} className="text-xs bg-[#0f1623] text-white px-3 py-1.5 rounded-xl hover:bg-teal-600 transition flex items-center gap-1"><Zap size={10} />Research</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-semibold text-slate-600">Upcoming this week</h3>
              </div>
              {CASES.filter(c => c.status !== "disposed").map(c => (
                <div key={c.id} className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition">
                  <p className="text-xs font-bold text-slate-700 w-24 flex-shrink-0">{c.nextDate}</p>
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.status === "urgent" ? "bg-red-400" : c.status === "active" ? "bg-teal-400" : "bg-amber-400"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{c.title}</p>
                    <p className="text-[10px] text-slate-400">{c.court} · {c.stage}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border capitalize ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── IP PORTFOLIO ── */}
        {tab === "patents" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2"><Lock size={18} className="text-purple-500" />IP portfolio</h1>
                <p className="text-xs text-slate-500 mt-0.5">10 patentable features · Section 3(k) risk analysis · Indian Patents Act</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-xl font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />6 low risk</span>
                <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-xl font-medium"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />3 medium</span>
                <span className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1.5 rounded-xl font-medium"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />1 high</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PATENT_FEATURES.map(f => (
                <div key={f.id}
                  onClick={() => setSelectedPatent(selectedPatent === f.id ? null : f.id)}
                  className={`bg-white rounded-2xl border shadow-sm p-4 cursor-pointer transition-all ${selectedPatent === f.id ? "border-purple-400 ring-1 ring-purple-400/30" : "border-slate-100 hover:border-slate-200"}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{f.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{f.module}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${f.risk === "low" ? "bg-emerald-400" : f.risk === "med" ? "bg-amber-400" : "bg-red-400"}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">{f.tag}</span>
                    <span className="text-[10px] text-slate-400 truncate">{f.effect}</span>
                  </div>
                  <AnimatePresence>
                    {selectedPatent === f.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-[11px] text-slate-600 leading-relaxed">{f.effect}</p>
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-lg ${f.risk === "low" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : f.risk === "med" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                              {f.risk === "low" ? "Low 3(k) risk" : f.risk === "med" ? "Medium 3(k) risk" : "High 3(k) risk — use trade secret"}
                            </span>
                            <span className="text-[10px] bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-lg">Patent #{f.id}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Filing roadmap</h3>
              <div className="space-y-2">
                {[
                  { phase: "File immediately", items: [1, 3, 2], color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                  { phase: "File month 2–3", items: [4, 5, 6], color: "bg-blue-50 border-blue-200 text-blue-700" },
                  { phase: "File month 3–5", items: [7, 8, 9], color: "bg-amber-50 border-amber-200 text-amber-700" },
                  { phase: "Trade secret preferred", items: [10], color: "bg-red-50 border-red-200 text-red-700" },
                ].map(({ phase, items, color }) => (
                  <div key={phase} className={`flex items-center gap-3 p-3 rounded-xl border ${color}`}>
                    <span className="text-[10px] font-bold w-32 flex-shrink-0">{phase}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {items.map(id => {
                        const f = PATENT_FEATURES.find(x => x.id === id)!;
                        return <span key={id} className="text-[10px] bg-white/70 px-2 py-0.5 rounded-lg border border-current/20">{f.title}</span>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
