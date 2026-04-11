"use client";
import React, { useState, useRef } from 'react';
import {
  Scale, Search, Zap, Loader2, Gavel, LayoutDashboard,
  ShieldCheck, Bell, Calendar, Briefcase,
  ChevronRight, Copy, Check, AlertCircle,
  Clock, FileText, Plus, Upload, Download,
  User, Settings, RefreshCw,
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
];
const TODAY_HEARINGS: Hearing[] = [
  { time: '10:30 AM', caseNo: 'S.B. Cr. Misc. 2201/2026', court: 'Court No. 3, RHC Jaipur', title: 'State v. Vikram Singh', urgent: true },
  { time: '11:15 AM', caseNo: 'CMP 44/2026', court: 'Court No. 7, District Jaipur', title: 'Ramesh v. PWD' },
];
const ACTIVITIES: Activity[] = [
  { text: 'Order uploaded — S.B. Cr. Rev. 412/2024', time: '9:14 AM', type: 'order' },
  { text: 'AI Research saved — Bail jurisprudence under BNSS', time: 'Yesterday', type: 'research' },
];

const PETITION_TEMPLATES = [
  'Bail Application (Regular Bail - Sec. 480 BNSS)',
  'Anticipatory Bail (Sec. 482 BNSS)',
  'Writ Petition (Art. 226 Constitution)',
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
  const [noteContent, setNoteContent] = useState('# Written Submissions\n\n## Facts\n\n1. \n\n## Points of Law\n\n1. \n\n## Prayer\n\nIt is, therefore, most respectfully prayed that...');
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
            parts: [{ text: `You are an elite Indian Legal Research AI for Adv. Gaurav Meena. Provide a professional legal summary for: ${userInput}` }]
          }]
        })
      });
      const data = await response.json();
      if (data.error) { setAiResponse(`❌ API ERROR: ${data.error.message}`); }
      else { setAiResponse(data.candidates[0].content.parts[0].text); }
      setShowResult(true);
    } catch {
      setAiResponse('❌ CONNECTION ERROR: Could not reach the Gemini 2 engine.');
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
    <div className="flex h-screen bg-[#f4f3ef] text-slate-900 overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-[#0f1623] text-white flex flex-col flex-shrink-0">
        <div className="px-6 pt-7 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
              <Scale size={16} className="text-[#0f1623]" />
            </div>
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
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeTab === id ? 'bg-teal-500/15 text-teal-300 font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 pb-5">
          <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <User size={14} className="text-teal-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">Adv. Gaurav Meena</p>
              <p className="text-[10px] text-slate-500 truncate">Rajasthan HC</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
            <h1 className="text-2xl font-bold mb-8">Good morning, Gaurav.</h1>
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-2xl font-bold">{CASES.length}</p>
                <p className="text-xs text-slate-500">Active Matters</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CASE DIARY ── */}
        {activeTab === 'casediary' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
            <h1 className="text-2xl font-bold mb-6">Case Diary</h1>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-50">
                {filteredCases.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold">{c.title}</p>
                      <p className="text-[11px] text-slate-400">{c.caseNo}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border capitalize ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── AI RESEARCH ── */}
        {activeTab === 'research' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Zap className="text-teal-500" /> AI Research</h1>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <textarea
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:border-teal-400 outline-none resize-none"
                placeholder="Describe your legal query..."
              />
              <button onClick={handleAISearch} disabled={isSearching}
                className="mt-3 bg-[#0f1623] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-teal-600 transition flex items-center gap-2">
                {isSearching ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />} Analyze
              </button>
            </div>
            {showResult && (
              <div className="mt-5 bg-white rounded-2xl border border-slate-200 p-6 text-sm whitespace-pre-wrap leading-relaxed">
                {aiResponse}
              </div>
            )}
          </motion.div>
        )}

        {/* ── NOTE MAKER ── */}
        {activeTab === 'notemaker' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-4">Note Maker</h1>
            
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3 flex-shrink-0 flex-wrap">
              {[
                { icon: Bold, tip: 'Bold' }, { icon: Italic, tip: 'Italic' },
                { icon: AlignLeft, tip: 'Heading' }, { icon: List, tip: 'List' },
                { icon: Link2, tip: 'Link' },
              ].map(({ icon: Icon, tip }) => (
                <button 
                  key={tip} 
                  title={tip} 
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                >
                  <Icon size={13} />
                </button>
              ))}
            </div>

            <textarea
              ref={noteRef}
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 text-sm leading-relaxed font-mono outline-none resize-none"
            />
          </motion.div>
        )}

      </main>
    </div>
  );
}