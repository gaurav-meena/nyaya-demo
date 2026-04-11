"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
  Scale, Search, Zap, Loader2, Gavel, LayoutDashboard,
  ShieldCheck, Bell, Calendar, Briefcase,
  ChevronRight, Copy, Check, AlertCircle,
  Clock, FileText, Plus, Upload, Download,
  User, Settings, RefreshCw, MapPin,
  PenLine, AlignLeft, Bold, Italic, List, Link2, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types & Data ---
interface Case {
  id: string; title: string; caseNo: string; court: string;
  nextDate: string; status: 'active' | 'adjourned' | 'disposed' | 'urgent';
  client: string; section: string; stage: string;
}
interface Hearing { time: string; caseNo: string; court: string; title: string; urgent?: boolean; }
interface Activity { text: string; time: string; type: 'filing' | 'order' | 'date' | 'research'; }

const CASES: Case[] = [
  { id: '1', title: 'Rajesh Kumar v. State of Rajasthan', caseNo: 'S.B. Cr. Rev. 412/2024', court: 'Rajasthan HC, Jodhpur', nextDate: '18 Apr 2026', status: 'urgent', client: 'Rajesh Kumar', section: 'Sec. 420 BNS', stage: 'Arguments' },
  { id: '2', title: 'M/s Arjun Traders v. Union of India', caseNo: 'D.B. Civil Writ 1887/2025', court: 'Rajasthan HC, Jodhpur', nextDate: '22 Apr 2026', status: 'active', client: 'M/s Arjun Traders', section: 'Art. 226 Constitution', stage: 'Evidence' },
  { id: '3', title: 'Sunita Devi v. Ramesh Chand', caseNo: 'Civil Suit 334/2023', court: 'District Court, Jaipur', nextDate: '25 Apr 2026', status: 'adjourned', client: 'Sunita Devi', section: 'Sec. 12 DV Act', stage: 'Interim Relief' },
];

const TODAY_HEARINGS: Hearing[] = [
  { time: '10:30 AM', caseNo: 'S.B. Cr. Misc. 2201/2026', court: 'Court No. 3, RHC Jaipur', title: 'State v. Vikram Singh', urgent: true },
  { time: '02:00 PM', caseNo: 'D.B. Civil Writ 1887/2025', court: 'D.B. No. 2, RHC Jodhpur', title: 'M/s Arjun Traders v. UoI' },
];

const ACTIVITIES: Activity[] = [
  { text: 'Order uploaded — S.B. Cr. Rev. 412/2024', time: '9:14 AM', type: 'order' },
  { text: 'AI Research saved — Bail jurisprudence under BNSS', time: 'Yesterday', type: 'research' },
];

const PETITION_TEMPLATES = ['Bail Application (Sec. 480 BNSS)', 'Writ Petition (Art. 226)', 'Counter Affidavit', 'Vakalatnama'];

const STATUS_STYLES: Record<Case['status'], string> = {
  urgent: 'bg-red-50 text-red-600 border-red-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  adjourned: 'bg-amber-50 text-amber-700 border-amber-200',
  disposed: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function NyayaAI() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [caseFilter, setCaseFilter] = useState<'all' | Case['status']>('all');
  const [filingStep, setFilingStep] = useState(1);
  const [noteContent, setNoteContent] = useState('# Written Submissions\n\n## Facts\n\n1. \n\n## Prayer...');
  const noteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const handleAISearch = async () => {
    if (!userInput.trim()) return;
    setIsSearching(true);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `You are an elite Indian Legal AI. Query: ${userInput}` }] }] })
      });
      const data = await response.json();
      setAiResponse(data.candidates[0].content.parts[0].text);
      setShowResult(true);
    } catch { setAiResponse('❌ Error.'); setShowResult(true); }
    finally { setIsSearching(false); }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredCases = caseFilter === 'all' ? CASES : CASES.filter(c => c.status === caseFilter);

  return (
    <div className="flex h-screen bg-[#f4f3ef] text-slate-900 overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f1623] text-white flex flex-col flex-shrink-0">
        <div className="px-6 pt-7 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center"><Scale size={16} className="text-[#0f1623]" /></div>
            <span className="text-lg font-bold tracking-tight">Nyaya<span className="text-teal-400">.ai</span></span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Command Center' },
            { id: 'casediary', icon: Briefcase, label: 'Case Diary' },
            { id: 'research', icon: Zap, label: 'AI Research' },
            { id: 'efiling', icon: Gavel, label: 'E-Filing' },
            { id: 'notemaker', icon: PenLine, label: 'Note Maker' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeTab === item.id ? 'bg-teal-500/15 text-teal-300 font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <item.icon size={16} /> <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 pb-5">
          <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center"><User size={14} className="text-teal-400" /></div>
            <div className="min-w-0"><p className="text-xs font-semibold truncate">Adv. Gaurav Meena</p><p className="text-[10px] text-slate-500 truncate">Rajasthan HC</p></div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto">
        
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-8">
            <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-2xl font-bold">{CASES.length}</p><p className="text-xs text-slate-500">Total Matters</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-2xl font-bold text-red-500">{CASES.filter(c => c.status === 'urgent').length}</p><p className="text-xs text-slate-500">Urgent Today</p>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-50 font-semibold text-sm">Today's Hearings</div>
               {TODAY_HEARINGS.map((h, i) => (
                 <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition">
                   <div className="text-xs font-bold text-slate-800 w-16">{h.time}</div>
                   <div className="flex-1"><p className="text-sm font-medium">{h.title}</p><p className="text-[11px] text-slate-400">{h.court}</p></div>
                   {h.urgent && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">URGENT</span>}
                 </div>
               ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'casediary' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
            <h1 className="text-2xl font-bold mb-6">Case Diary</h1>
            <div className="flex gap-2 mb-6">
               {['all', 'urgent', 'active'].map(f => (
                 <button key={f} onClick={() => setCaseFilter(f as any)} className={`px-4 py-1.5 rounded-xl text-xs capitalize ${caseFilter === f ? 'bg-[#0f1623] text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>{f}</button>
               ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
               {filteredCases.map(c => (
                 <div key={c.id} className="px-6 py-4 border-b last:border-0 flex items-center justify-between">
                   <div><p className="text-sm font-semibold">{c.title}</p><p className="text-[11px] text-slate-400">{c.caseNo} · {c.stage}</p></div>
                   <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border capitalize ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                 </div>
               ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'research' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Zap className="text-teal-500" size={20} /> AI Research Engine</h1>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <textarea value={userInput} onChange={e => setUserInput(e.target.value)} rows={3} className="w-full bg-slate-50 p-4 rounded-xl text-sm focus:border-teal-400 outline-none" placeholder="Describe your legal query..." />
              <button onClick={handleAISearch} disabled={isSearching} className="mt-3 bg-[#0f1623] text-white px-6 py-2 rounded-xl text-xs font-semibold hover:bg-teal-600 transition">
                {isSearching ? <Loader2 className="animate-spin" size={14} /> : "Analyze Jurisprudence"}
              </button>
            </div>
            {showResult && (
               <div className="mt-6 bg-white p-8 rounded-2xl border border-slate-200 text-sm whitespace-pre-wrap leading-relaxed shadow-sm">
                 <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-teal-600 uppercase tracking-widest"><CheckCircle2 size={12}/> Analysis Complete</div>
                 {aiResponse}
               </div>
            )}
          </motion.div>
        )}

        {activeTab === 'notemaker' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-4">Note Maker</h1>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-2 mb-4">
              {[Bold, Italic, List, AlignLeft, Link2].map((Icon, i) => <button key={i} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Icon size={14}/></button>)}
            </div>
            <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-2xl p-8 text-sm leading-loose font-mono outline-none resize-none" placeholder="Start drafting..." />
          </motion.div>
        )}

        {activeTab === 'efiling' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-4xl">
              <h1 className="text-2xl font-bold mb-6">E-Filing Portal</h1>
              <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center shadow-sm">
                 <Gavel size={40} className="text-teal-500 mx-auto mb-4" />
                 <h3 className="text-lg font-bold">Ready to Draft</h3>
                 <p className="text-sm text-slate-500 mt-2">The e-filing automation module is active. Select a template to begin.</p>
                 <div className="grid grid-cols-2 gap-4 mt-8">
                    {PETITION_TEMPLATES.map(t => <button key={t} className="p-4 border border-slate-100 rounded-2xl text-xs font-medium hover:border-teal-400 hover:bg-teal-50 transition">{t}</button>)}
                 </div>
              </div>
           </motion.div>
        )}

      </main>
    </div>
  );
}