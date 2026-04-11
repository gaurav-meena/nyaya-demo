"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
  Scale, Search, Zap, Loader2, Gavel, LayoutDashboard,
  ShieldCheck, BookOpen, FileEdit, Bell, Calendar,
  ChevronRight, ChevronDown, Copy, Check, AlertCircle,
  Clock, TrendingUp, FileText, Plus, Upload, Download,
  User, Settings, LogOut, Star, Filter, MoreHorizontal,
  CheckCircle2, XCircle, Circle, ArrowUpRight, Hash,
  Briefcase, MapPin, Archive, Inbox, Send, RefreshCw,
  PenLine, AlignLeft, Bold, Italic, List, Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Case {
  id: string; title: string; caseNo: string; court: string;
  nextDate: string; status: 'active' | 'adjourned' | 'disposed' | 'urgent';
  client: string; section: string; stage: string;
}
interface Hearing { time: string; caseNo: string; court: string; title: string; urgent?: boolean; }
interface Activity { text: string; time: string; type: 'filing' | 'order' | 'date' | 'research'; }

// ─── Demo Data ─────────────────────────────────────────────────────────────────
const CASES: Case[] = [
  { id: '1', title: 'Rajesh Kumar v. State of Rajasthan', caseNo: 'S.B. Cr. Rev. 412/2024', court: 'Rajasthan HC, Jodhpur', nextDate: '18 Apr 2026', status: 'urgent', client: 'Rajesh Kumar', section: 'Sec. 420 BNS', stage: 'Arguments' },
  { id: '2', title: 'M/s Arjun Traders v. Union of India', caseNo: 'D.B. Civil Writ 1887/2025', court: 'Rajasthan HC, Jodhpur', nextDate: '22 Apr 2026', status: 'active', client: 'M/s Arjun Traders', section: 'Art. 226 Constitution', stage: 'Evidence' },
  { id: '3', title: 'Sunita Devi v. Ramesh Chand', caseNo: 'Civil Suit 334/2023', court: 'District Court, Jaipur', nextDate: '25 Apr 2026', status: 'adjourned', client: 'Sunita Devi', section: 'Sec. 12 DV Act', stage: 'Interim Relief' },
  { id: '4', title: 'State v. Vikram Singh (Bail)', caseNo: 'S.B. Cr. Misc. 2201/2026', court: 'Rajasthan HC, Jaipur', nextDate: '14 Apr 2026', status: 'urgent', client: 'Vikram Singh', section: 'Sec. 439 BNSS', stage: 'Final Hearing' },
  { id: '5', title: 'Priya Sharma v. ABC Pvt Ltd', caseNo: 'CS 778/2025', court: 'Civil Court, Ajmer', nextDate: '03 May 2026', status: 'active', client: 'Priya Sharma', section: 'Sec. 14 CPA', stage: 'Written Statement' },
  { id: '6', title: 'Govind Ram v. Collector, Bikaner', caseNo: 'RLW 902/2024', court: 'Revenue Tribunal, Raj.', nextDate: '06 May 2026', status: 'active', client: 'Govind Ram', section: 'Rajasthan Land Rev. Act', stage: 'Filing' },
];
const TODAY_HEARINGS: Hearing[] = [
  { time: '10:30 AM', caseNo: 'S.B. Cr. Misc. 2201/2026', court: 'Court No. 3, RHC Jaipur', title: 'State v. Vikram Singh', urgent: true },
  { time: '11:15 AM', caseNo: 'CMP 44/2026', court: 'Court No. 7, District Jaipur', title: 'Ramesh v. PWD' },
  { time: '02:00 PM', caseNo: 'D.B. Civil Writ 1887/2025', court: 'D.B. No. 2, RHC Jodhpur', title: 'M/s Arjun Traders v. UoI' },
];
const ACTIVITIES: Activity[] = [
  { text: 'Order uploaded — S.B. Cr. Rev. 412/2024', time: '9:14 AM', type: 'order' },
  { text: 'Next date auto-synced — Civil Suit 334/2023 → 25 Apr', time: 'Yesterday', type: 'date' },
  { text: 'AI Research saved — Bail jurisprudence under BNSS', time: 'Yesterday', type: 'research' },
  { text: 'E-filing submitted — RLW 902/2024 Written Submission', time: '10 Apr', type: 'filing' },
];

const PETITION_TEMPLATES = [
  'Bail Application (Regular Bail - Sec. 480 BNSS)',
  'Anticipatory Bail (Sec. 482 BNSS)',
  'Writ Petition (Art. 226 Constitution)',
  'Revision Petition (Sec. 442 BNSS)',
  'Civil Misc. Application',
  'Written Submissions',
  'Counter Affidavit',
  'Vakalatnama',
];

const STATUS_STYLES: Record<Case['status'], string> = {
  urgent: 'bg-red-50 text-red-600 border-red-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  adjourned: 'bg-amber-50 text-amber-700 border-amber-200',
  disposed: 'bg-slate-100 text-slate-500 border-slate-200',
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function NyayaAI() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [caseFilter, setCaseFilter] = useState<'all' | Case['status']>('all');
  const [selectedTemplate, setSelectedTemplate] = useState(PETITION_TEMPLATES[0]);
  const [filingStep, setFilingStep] = useState(1);
  const [noteContent, setNoteContent] = useState('# Written Submissions\n\n## Facts\n\n1. \n\n## Points of Law\n\n1. \n\n## Prayer\n\nIt is, therefore, most respectfully prayed that this Hon\'ble Court may graciously be pleased to...');
  const [petitionForm, setPetitionForm] = useState({ petitioner: '', respondent: '', court: '', section: '', facts: '', prayer: '' });
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const handleAISearch = async () => {
    if (!userInput.trim()) return;
    setIsSearching(true);
    setShowResult(false);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      setAiResponse('❌ CONFIG ERROR: API Key missing in Vercel settings.');
      setShowResult(true); setIsSearching(false); return;
    }
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `You are an elite Indian Legal Research AI for Adv. Gaurav Meena. Provide a professional legal summary with: 1) A brief legal position (2-3 sentences), 2) Relevant sections under BNS/BNSS/IEA/Constitution with exact section numbers, 3) 2-3 landmark Supreme Court or Rajasthan High Court precedents with citations, 4) A practical litigation tip. Use clear headings. Keep it precise and citation-accurate. Query: ${userInput}` }]
          }]
        })
      });
      const data = await response.json();
      if (data.error) { setAiResponse(`❌ API ERROR: ${data.error.message}`); }
      else { setAiResponse(data.candidates[0].content.parts[0].text); }
      setShowResult(true);
    } catch {
      setAiResponse('❌ CONNECTION ERROR: Could not reach the Gemini 2.5 engine.');
      setShowResult(true);
    } finally { setIsSearching(false); }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredCases = caseFilter === 'all' ? CASES : CASES.filter(c => c.status === caseFilter);
  const urgentCount = CASES.filter(c => c.status === 'urgent').length;

  return (
    <div className="flex h-screen bg-[#f4f3ef] text-slate-900 overflow-hidden" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-[#0f1623] text-white flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-6 pt-7 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
              <Scale size={16} className="text-[#0f1623]" />
            </div>
            <span className="text-lg font-bold tracking-tight">Nyaya<span className="text-teal-400">.ai</span></span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-widest">Legal Operating System</p>
        </div>

        {/* Urgent badge */}
        {urgentCount > 0 && (
          <div className="mx-4 mt-4 mb-1 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[11px] text-red-400 font-medium">{urgentCount} urgent hearing{urgentCount > 1 ? 's' : ''} today</span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Command Center' },
            { id: 'casediary', icon: Briefcase, label: 'Case Diary' },
            { id: 'research', icon: Zap, label: 'AI Research' },
            { id: 'efiling', icon: Gavel, label: 'E-Filing' },
            { id: 'notemaker', icon: PenLine, label: 'Note Maker' },
            { id: 'causelist', icon: Calendar, label: "Today's Cause List" },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeTab === id ? 'bg-teal-500/15 text-teal-300 font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <Icon size={16} />
              <span>{label}</span>
              {id === 'casediary' && <span className="ml-auto text-[10px] bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded-md">{CASES.length}</span>}
              {id === 'causelist' && urgentCount > 0 && <span className="ml-auto text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-md">{urgentCount}</span>}
            </button>
          ))}
        </nav>

        {/* Profile */}
        <div className="px-4 pb-5">
          <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <User size={14} className="text-teal-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">Adv. Gaurav Meena</p>
              <p className="text-[10px] text-slate-500 truncate">Rajasthan HC · Enr. RJ/2026/1234</p>
            </div>
            <button className="ml-auto text-slate-600 hover:text-slate-400 transition"><Settings size={13} /></button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Good morning, Gaurav.</h1>
                <p className="text-sm text-slate-500 mt-0.5">Saturday, 12 April 2026 · {TODAY_HEARINGS.length} hearings scheduled today</p>
              </div>
              <button className="flex items-center gap-2 text-xs bg-[#0f1623] text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition">
                <RefreshCw size={12} /> Sync e-Courts
              </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Active Cases', value: CASES.filter(c => c.status !== 'disposed').length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Hearings Today', value: TODAY_HEARINGS.length, icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50' },
                { label: 'Urgent / Red', value: urgentCount, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
                { label: 'Pending Filings', value: 2, icon: Upload, color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon size={16} className={color} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-5">
              {/* Today's hearings */}
              <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                  <h2 className="font-semibold text-sm text-slate-800 flex items-center gap-2"><Clock size={14} className="text-teal-500" /> Today's Hearings</h2>
                  <button className="text-xs text-teal-600 hover:underline" onClick={() => setActiveTab('causelist')}>View all</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {TODAY_HEARINGS.map((h, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/50 transition">
                      <div className="text-right min-w-[60px]">
                        <p className="text-xs font-bold text-slate-800">{h.time}</p>
                      </div>
                      <div className={`w-0.5 h-8 rounded-full ${h.urgent ? 'bg-red-400' : 'bg-teal-300'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{h.title}</p>
                        <p className="text-[11px] text-slate-400">{h.caseNo} · {h.court}</p>
                      </div>
                      {h.urgent && <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">URGENT</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity feed */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                  <h2 className="font-semibold text-sm text-slate-800 flex items-center gap-2"><Bell size={14} className="text-teal-500" /> Recent Activity</h2>
                </div>
                <div className="px-5 py-3 space-y-3">
                  {ACTIVITIES.map((a, i) => {
                    const icons: Record<Activity['type'], React.ReactNode> = {
                      order: <FileText size={12} className="text-blue-500" />,
                      date: <Calendar size={12} className="text-amber-500" />,
                      research: <Search size={12} className="text-purple-500" />,
                      filing: <Upload size={12} className="text-teal-500" />,
                    };
                    return (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="mt-0.5 w-5 h-5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">{icons[a.type]}</div>
                        <div>
                          <p className="text-xs text-slate-700 leading-snug">{a.text}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{a.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upcoming dates */}
            <div className="mt-5 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                <h2 className="font-semibold text-sm text-slate-800 flex items-center gap-2"><Calendar size={14} className="text-teal-500" /> Upcoming Dates (Next 30 days)</h2>
                <button className="text-xs text-teal-600 hover:underline" onClick={() => setActiveTab('casediary')}>View case diary</button>
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-50">
                {CASES.filter(c => c.status !== 'disposed').slice(0, 3).map(c => (
                  <div key={c.id} className="px-6 py-4 hover:bg-slate-50/40 transition">
                    <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wide">{c.nextDate}</p>
                    <p className="text-sm font-medium text-slate-800 mt-1 truncate">{c.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.caseNo} · {c.stage}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CASE DIARY ── */}
        {activeTab === 'casediary' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Case Diary</h1>
                <p className="text-sm text-slate-500 mt-0.5">{CASES.length} matters on record</p>
              </div>
              <button className="flex items-center gap-2 text-xs bg-teal-500 text-white px-4 py-2.5 rounded-xl hover:bg-teal-600 transition">
                <Plus size={13} /> New Matter
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-5">
              {(['all', 'urgent', 'active', 'adjourned', 'disposed'] as const).map(f => (
                <button key={f} onClick={() => setCaseFilter(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${caseFilter === f ? 'bg-[#0f1623] text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}>
                  {f === 'all' ? `All (${CASES.length})` : f}
                </button>
              ))}
            </div>

            {/* Case table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] text-[11px] font-bold text-slate-400 uppercase tracking-wider px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                <span>Matter</span><span>Case No.</span><span>Court</span><span>Next Date</span><span>Stage</span><span></span>
              </div>
              <div className="divide-y divide-slate-50">
                {filteredCases.map(c => (
                  <div key={c.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] items-center px-6 py-4 hover:bg-slate-50/40 transition group">
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-semibold text-slate-800 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{c.client} · {c.section}</p>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{c.caseNo}</p>
                    <p className="text-xs text-slate-500 pr-2">{c.court.split(',')[0]}</p>
                    <p className="text-xs font-semibold text-slate-700">{c.nextDate}</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border w-fit capitalize ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                    <button className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-slate-100">
                      <MoreHorizontal size={14} className="text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── AI RESEARCH ── */}
        {activeTab === 'research' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-8 max-w-4xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Zap size={20} className="text-teal-500" /> AI Research Engine</h1>
              <p className="text-sm text-slate-500 mt-0.5">Powered by Gemini 2.5 Flash · BNS, BNSS, IEA, Constitution, Labour Codes</p>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              {['Bail under BNSS', 'Art. 226 writ maintainability', 'Anticipatory bail conditions', 'Domestic violence interim relief', 'Dowry death presumption'].map(q => (
                <button key={q} onClick={() => setUserInput(q)}
                  className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl hover:border-teal-400 hover:text-teal-600 transition">
                  {q}
                </button>
              ))}
            </div>

            {/* Search box */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="relative">
                <textarea
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAISearch(); } }}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 outline-none resize-none"
                  placeholder="Describe your legal query in plain language… (Enter to search)"
                />
                <button onClick={handleAISearch} disabled={isSearching || !userInput.trim()}
                  className="absolute bottom-3 right-3 bg-[#0f1623] disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-teal-600 transition flex items-center gap-2">
                  {isSearching ? <><Loader2 size={12} className="animate-spin" /> Analyzing…</> : <><Search size={12} /> Analyze</>}
                </button>
              </div>
            </div>

            {/* Result */}
            <AnimatePresence>
              {showResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-teal-500" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Jurisprudence Analysis</span>
                      </div>
                      <button onClick={() => handleCopy(aiResponse)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition px-2.5 py-1.5 rounded-lg hover:bg-slate-100">
                        {copied ? <><Check size={11} className="text-teal-500" /> Copied!</> : <><Copy size={11} /> Copy</>}
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed research-output">
                        {aiResponse.split('\n').map((line, i) => {
                          if (line.startsWith('## ') || line.startsWith('# ')) return <h3 key={i} className="font-bold text-slate-900 text-base mt-4 mb-2 first:mt-0">{line.replace(/^##? /, '')}</h3>;
                          if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-slate-800 mt-2">{line.replace(/\*\*/g, '')}</p>;
                          if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 mb-1 list-disc text-slate-700">{line.replace(/^[-*] /, '')}</li>;
                          if (!line.trim()) return <div key={i} className="h-1" />;
                          return <p key={i} className="mb-1.5">{line}</p>;
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── E-FILING ── */}
        {activeTab === 'efiling' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-8 max-w-4xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Gavel size={20} className="text-teal-500" /> E-Filing Portal</h1>
              <p className="text-sm text-slate-500 mt-0.5">Draft, format & submit petitions to Rajasthan High Court e-filing system</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-0 mb-8">
              {['Select Template', 'Party Details', 'Draft & Preview', 'Submit'].map((label, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-2" onClick={() => setFilingStep(i + 1)} style={{ cursor: 'pointer' }}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${filingStep > i + 1 ? 'bg-teal-500 text-white' : filingStep === i + 1 ? 'bg-[#0f1623] text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {filingStep > i + 1 ? <Check size={12} /> : i + 1}
                    </div>
                    <span className={`text-xs font-medium ${filingStep === i + 1 ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
                  </div>
                  {i < 3 && <div className={`flex-1 h-0.5 mx-2 ${filingStep > i + 1 ? 'bg-teal-400' : 'bg-slate-200'}`} />}
                </React.Fragment>
              ))}
            </div>

            {filingStep === 1 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Select Petition Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {PETITION_TEMPLATES.map(t => (
                    <label key={t} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedTemplate === t ? 'border-teal-400 bg-teal-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="template" value={t} checked={selectedTemplate === t} onChange={() => setSelectedTemplate(t)} className="text-teal-500" />
                      <span className="text-sm font-medium text-slate-700">{t}</span>
                    </label>
                  ))}
                </div>
                <button onClick={() => setFilingStep(2)} className="mt-6 bg-[#0f1623] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-600 transition flex items-center gap-2">
                  Continue <ChevronRight size={15} />
                </button>
              </div>
            )}

            {filingStep === 2 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-5">Party & Court Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { field: 'petitioner', label: 'Petitioner / Applicant', placeholder: 'Full name of petitioner' },
                    { field: 'respondent', label: 'Respondent', placeholder: 'State of Rajasthan / Opposing party' },
                    { field: 'court', label: 'Court / Bench', placeholder: 'e.g. S.B. Division, RHC Jodhpur' },
                    { field: 'section', label: 'Under Section / Article', placeholder: 'e.g. Sec. 480 BNSS, Art. 226' },
                  ].map(({ field, label, placeholder }) => (
                    <div key={field}>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
                      <input
                        value={petitionForm[field as keyof typeof petitionForm]}
                        onChange={e => setPetitionForm(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-teal-400 outline-none transition"
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Brief Facts</label>
                    <textarea value={petitionForm.facts} onChange={e => setPetitionForm(prev => ({ ...prev, facts: e.target.value }))}
                      rows={3} placeholder="Concise statement of relevant facts…"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-teal-400 outline-none resize-none transition" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Prayer</label>
                    <textarea value={petitionForm.prayer} onChange={e => setPetitionForm(prev => ({ ...prev, prayer: e.target.value }))}
                      rows={2} placeholder="It is, therefore, most respectfully prayed that…"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-teal-400 outline-none resize-none transition" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setFilingStep(1)} className="border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition">Back</button>
                  <button onClick={() => setFilingStep(3)} className="bg-[#0f1623] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-600 transition flex items-center gap-2">
                    Generate Draft <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {filingStep === 3 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-semibold text-sm text-slate-700">Draft Preview — {selectedTemplate}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleCopy(`IN THE RAJASTHAN HIGH COURT\n\n${selectedTemplate.toUpperCase()}\n\nIN THE MATTER OF:\n${petitionForm.petitioner || 'Petitioner Name'} … Petitioner\n\nVERSUS\n\n${petitionForm.respondent || 'Respondent'} … Respondent\n\nBrief Facts:\n${petitionForm.facts || '…'}\n\nPrayer:\n${petitionForm.prayer || '…'}`)}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg transition">
                      <Copy size={11} /> Copy
                    </button>
                    <button className="flex items-center gap-1.5 text-xs bg-teal-500 text-white px-3 py-1.5 rounded-lg hover:bg-teal-600 transition">
                      <Download size={11} /> Export PDF
                    </button>
                  </div>
                </div>
                <div className="p-8 font-serif text-sm leading-loose text-slate-800 bg-[#fdfcfb]" style={{ fontFamily: 'Georgia, serif' }}>
                  <p className="text-center font-bold uppercase tracking-wider text-base mb-6">IN THE HIGH COURT OF JUDICATURE FOR RAJASTHAN</p>
                  <p className="text-center text-slate-600 mb-6">{petitionForm.court || '[Court / Bench]'}</p>
                  <p className="font-bold text-center uppercase mb-6">{selectedTemplate}</p>
                  <p className="mb-2">IN THE MATTER OF:</p>
                  <p className="ml-8 mb-1">{petitionForm.petitioner || '[Petitioner Name]'} <span className="float-right text-slate-500">…Petitioner</span></p>
                  <p className="text-center my-3 text-slate-500 clear-both">VERSUS</p>
                  <p className="ml-8 mb-4">{petitionForm.respondent || '[Respondent]'} <span className="float-right text-slate-500">…Respondent</span></p>
                  <p className="font-bold mt-6 mb-2 clear-both">UNDER SECTION/ARTICLE:</p>
                  <p className="ml-4 mb-4">{petitionForm.section || '[Section / Article]'}</p>
                  <p className="font-bold mt-4 mb-2">BRIEF FACTS:</p>
                  <p className="ml-4 text-slate-700 leading-relaxed">{petitionForm.facts || '[Facts to be stated here…]'}</p>
                  <p className="font-bold mt-6 mb-2">PRAYER:</p>
                  <p className="ml-4 text-slate-700">{petitionForm.prayer || '[Prayer clause…]'}</p>
                  <div className="mt-12 text-right">
                    <p>Respectfully submitted,</p>
                    <p className="mt-6 font-bold">Adv. Gaurav Meena</p>
                    <p className="text-slate-500 text-xs">Enrollment No. RJ/2026/1234</p>
                    <p className="text-slate-500 text-xs">Rajasthan High Court</p>
                  </div>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
                  <button onClick={() => setFilingStep(2)} className="border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition">Back</button>
                  <button onClick={() => setFilingStep(4)} className="bg-teal-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-600 transition flex items-center gap-2">
                    Proceed to Submit <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {filingStep === 4 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-teal-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Ready for E-Filing</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Your petition has been formatted per Rajasthan HC e-filing standards. Attach vakalatnama & court fees before submission.</p>
                <div className="flex items-center justify-center gap-3">
                  <button className="flex items-center gap-2 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition">
                    <Upload size={14} /> Attach Documents
                  </button>
                  <button className="flex items-center gap-2 bg-[#0f1623] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-600 transition">
                    <Send size={14} /> Submit to e-Filing Portal
                  </button>
                </div>
                <button onClick={() => setFilingStep(1)} className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline">Start new filing</button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── NOTE MAKER ── */}
        {activeTab === 'notemaker' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-8 h-full flex flex-col max-h-[calc(100vh-0px)]">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><PenLine size={20} className="text-teal-500" /> Note Maker</h1>
                <p className="text-sm text-slate-500 mt-0.5">Draft written submissions, counter affidavits, and legal opinions</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleCopy(noteContent)} className="flex items-center gap-1.5 text-xs border border-slate-200 text-slate-600 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition">
                  {copied ? <><Check size={11} className="text-teal-500" /> Copied!</> : <><Copy size={11} /> Copy</>}
                </button>
                <button className="flex items-center gap-1.5 text-xs bg-teal-500 text-white px-3.5 py-2 rounded-xl hover:bg-teal-600 transition">
                  <Download size={11} /> Export DOCX
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3 flex-shrink-0 flex-wrap">
              {[
                { icon: Bold, tip: 'Bold' }, { icon: Italic, tip: 'Italic' },
                { icon: AlignLeft, tip: 'Heading' }, { icon: List, tip: 'List' },
                { icon: Link2, tip: 'Link' }, { icon: Hash, tip: 'Citation' },
              ].map(({ icon: Icon, tip }) => (
                <button key={tip} title={tip} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition" title={tip}>
                  <Icon size={13} />
                </button>
              ))}
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <select className="text-xs text-slate-600 bg-transparent border-none outline-none cursor-pointer">
                <option>Written Submissions</option>
                <option>Counter Affidavit</option>
                <option>Legal Opinion</option>
                <option>Rejoinder</option>
              </select>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-teal-600">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                Auto-saved
              </div>
            </div>

            <div className="flex gap-4 flex-1 min-h-0">
              {/* Editor */}
              <div className="flex-1 min-h-0">
                <textarea
                  ref={noteRef}
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  className="w-full h-full bg-white border border-slate-200 rounded-2xl p-6 text-sm leading-relaxed font-mono text-slate-800 resize-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/20 outline-none"
                  placeholder="Start typing your submission…"
                  style={{ fontFamily: 'ui-monospace, "Cascadia Code", monospace', fontSize: '13px', lineHeight: '1.8' }}
                />
              </div>
              {/* Snippet panel */}
              <div className="w-56 flex-shrink-0">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 h-full overflow-y-auto">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Inserts</p>
                  {[
                    { label: 'Prayer clause', text: '\n\nPRAYER:\nIt is therefore most respectfully prayed that this Hon\'ble Court may graciously be pleased to...' },
                    { label: 'Verification', text: '\n\nVERIFICATION:\nI, the deponent, do hereby verify that the contents of this affidavit are true to my knowledge...' },
                    { label: 'Humble submission', text: '\n\nThat it is humbly submitted that...' },
                    { label: 'Without prejudice', text: ' (without prejudice to all other contentions and submissions)' },
                    { label: 'Sec. 439 BNSS', text: ' under Section 439 of the Bharatiya Nagarik Suraksha Sanhita, 2023' },
                    { label: 'Art. 226 prayer', text: ' under Article 226 of the Constitution of India' },
                  ].map(({ label, text }) => (
                    <button key={label} onClick={() => setNoteContent(prev => prev + text)}
                      className="w-full text-left text-xs text-slate-600 px-3 py-2 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition mb-1">
                      + {label}
                    </button>
                  ))}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Word count</p>
                    <p className="text-lg font-bold text-slate-800">{noteContent.split(/\s+/).filter(Boolean).length}</p>
                    <p className="text-[10px] text-slate-400">words · {noteContent.length} chars</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CAUSE LIST ── */}
        {activeTab === 'causelist' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Calendar size={20} className="text-teal-500" /> Today's Cause List</h1>
                <p className="text-sm text-slate-500 mt-0.5">Saturday, 12 April 2026 · Auto-synced from Rajasthan HC</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  Live sync
                </div>
                <button className="flex items-center gap-1.5 text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {TODAY_HEARINGS.map((h, i) => (
                <div key={i} className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-6 ${h.urgent ? 'border-red-200' : 'border-slate-100'}`}>
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${h.urgent ? 'bg-red-50' : 'bg-teal-50'}`}>
                    <p className={`text-xs font-bold ${h.urgent ? 'text-red-500' : 'text-teal-600'}`}>{h.time.split(' ')[1]}</p>
                    <p className={`text-sm font-black ${h.urgent ? 'text-red-600' : 'text-teal-700'}`}>{h.time.split(' ')[0]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-slate-900">{h.title}</p>
                      {h.urgent && <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">URGENT</span>}
                    </div>
                    <p className="text-sm text-slate-500">{h.caseNo}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin size={11} className="text-slate-400" />
                      <p className="text-xs text-slate-400">{h.court}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => { setActiveTab('notemaker'); }}
                      className="text-xs border border-slate-200 text-slate-600 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5">
                      <PenLine size={11} /> Notes
                    </button>
                    <button onClick={() => setActiveTab('research')}
                      className="text-xs bg-[#0f1623] text-white px-3.5 py-2 rounded-xl hover:bg-teal-600 transition flex items-center gap-1.5">
                      <Zap size={11} /> Research
                    </button>
                  </div>
                </div>
              ))}

              {/* Upcoming this week */}
              <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-semibold text-sm text-slate-700">Upcoming This Week</h3>
                </div>
                {CASES.filter(c => c.status !== 'disposed').map(c => (
                  <div key={c.id} className="flex items-center gap-4 px-6 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition">
                    <div className="text-right w-24 flex-shrink-0">
                      <p className="text-xs font-bold text-slate-800">{c.nextDate}</p>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.status === 'urgent' ? 'bg-red-400' : c.status === 'active' ? 'bg-teal-400' : 'bg-amber-400'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-400">{c.court} · {c.stage}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border capitalize ${STATUS_STYLES[c.status]}`}>{c.status}</span>
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
