"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
  Scale, Search, Zap, Loader2, Gavel, LayoutDashboard,
  ShieldCheck, Bell, Calendar, Briefcase,
  ChevronRight, Copy, Check, AlertCircle,
  Clock, FileText, Plus, Upload, Download,
  User, Settings, RefreshCw,
  PenLine, AlignLeft, Bold, Italic, List, Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Demo Data & Types ---
interface Case {
  id: string; title: string; caseNo: string; court: string;
  nextDate: string; status: 'active' | 'adjourned' | 'disposed' | 'urgent';
  client: string; section: string; stage: string;
}
interface Hearing { time: string; caseNo: string; court: string; title: string; urgent?: boolean; }
const CASES: Case[] = [
  { id: '1', title: 'Rajesh Kumar v. State of Rajasthan', caseNo: 'S.B. Cr. Rev. 412/2024', court: 'Rajasthan HC, Jodhpur', nextDate: '18 Apr 2026', status: 'urgent', client: 'Rajesh Kumar', section: 'Sec. 420 BNS', stage: 'Arguments' },
  { id: '2', title: 'M/s Arjun Traders v. Union of India', caseNo: 'D.B. Civil Writ 1887/2025', court: 'Rajasthan HC, Jodhpur', nextDate: '22 Apr 2026', status: 'active', client: 'M/s Arjun Traders', section: 'Art. 226 Constitution', stage: 'Evidence' },
];
const TODAY_HEARINGS: Hearing[] = [
  { time: '10:30 AM', caseNo: 'S.B. Cr. Misc. 2201/2026', court: 'Court No. 3, RHC Jaipur', title: 'State v. Vikram Singh', urgent: true },
];

export default function NyayaAI() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userInput, setUserInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  // CRITICAL: This prevents the "Loading" freeze
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Wait for browser to be ready

  const handleAISearch = async () => {
    if (!userInput.trim()) return;
    setIsSearching(true);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: userInput }] }] })
      });
      const data = await response.json();
      setAiResponse(data.candidates[0].content.parts[0].text);
      setShowResult(true);
    } catch (e) {
      setAiResponse("Connection error.");
      setShowResult(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f3ef] text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f1623] text-white flex flex-col flex-shrink-0">
        <div className="px-6 pt-7 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center"><Scale size={16} className="text-[#0f1623]" /></div>
            <span className="text-lg font-bold">Nyaya<span className="text-teal-400">.ai</span></span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[{ id: 'dashboard', icon: LayoutDashboard, label: 'Command Center' }, { id: 'research', icon: Zap, label: 'AI Research' }].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${activeTab === item.id ? 'bg-teal-500/15 text-teal-300' : 'text-slate-400'}`}>
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-2xl font-bold">Welcome, Adv. Gaurav Meena</h1>
            <p className="text-slate-500 mt-2">Rajasthan High Court Portal Active</p>
          </motion.div>
        )}
        {activeTab === 'research' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <textarea value={userInput} onChange={e => setUserInput(e.target.value)} className="w-full bg-slate-50 p-4 rounded-xl outline-none" placeholder="Enter legal query..." />
              <button onClick={handleAISearch} className="mt-4 bg-[#0f1623] text-white px-6 py-2 rounded-xl text-sm">
                {isSearching ? "Analyzing..." : "Analyze"}
              </button>
            </div>
            {showResult && <div className="mt-6 bg-white p-6 rounded-2xl border border-slate-200 text-sm whitespace-pre-wrap">{aiResponse}</div>}
          </motion.div>
        )}
      </main>
    </div>
  );
}