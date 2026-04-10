"use client";
import React, { useState } from 'react';
import { Scale, Search, Mail, Zap, ChevronRight, Loader2, Gavel, LayoutDashboard, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NyayaAI() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const handleAISearch = async () => {
    if (!userInput) return;
    setIsSearching(true);
    setShowResult(false);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      setAiResponse("❌ CONFIG ERROR: API Key missing in Vercel. Please check Settings > Environment Variables.");
      setShowResult(true);
      setIsSearching(false);
      return;
    }

    try {
      // UPDATED TO STABLE v1 ENDPOINT
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `You are an elite Indian Legal Research AI for Adv. Gaurav Meena. Provide a professional legal summary, relevant sections of Indian law (BNS/Evidence Act/Constitution), and Rajasthan High Court precedents for: ${userInput}` }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        // More helpful error message for debugging
        setAiResponse(`❌ GOOGLE API ERROR (${data.error.code}): ${data.error.message}\n\nTip: Ensure the 'Generative Language API' is enabled in your Google Cloud Project.`);
      } else {
        const resultText = data.candidates[0].content.parts[0].text;
        setAiResponse(resultText);
      }
      setShowResult(true);
    } catch (error) {
      setAiResponse("❌ NETWORK ERROR: Could not connect to the server. Check your internet.");
      setShowResult(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      <aside className="w-72 bg-slate-900 text-white p-8 flex flex-col shadow-2xl border-r border-slate-800">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-teal-500 p-2.5 rounded-xl shadow-lg shadow-teal-500/20">
            <Scale size={28} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Nyaya<span className="text-teal-400">.ai</span></span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Command Center" />
          <TabButton active={activeTab === 'research'} onClick={() => setActiveTab('research')} icon={<Zap size={20}/>} label="Deep Research" />
          <TabButton active={activeTab === 'filing'} onClick={() => setActiveTab('filing')} icon={<Gavel size={20}/>} label="E-Filing Portal" />
        </nav>

        <div className="mt-auto">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
             <div className="flex items-center gap-2 mb-1 text-teal-400">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Identity Verified</span>
             </div>
             <p className="text-sm font-bold truncate">Adv. Gaurav Meena</p>
             <p className="text-[10px] text-slate-400">Rajasthan High Court</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 p-12">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-8">Morning, Counsel.</h1>
            <div className="grid grid-cols-2 gap-8">
              <DashboardCard title="Urgent Updates" icon={<Mail className="text-teal-500" />}>
                <p className="text-sm font-medium text-slate-600 italic">No pending notifications from GNLU registrar.</p>
              </DashboardCard>
            </div>
          </motion.div>
        )}

        {activeTab === 'research' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 mb-8">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Search className="text-teal-500" size={28} /> AI Precedent Engine
              </h2>
              <div className="relative">
                <input 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 px-8 text-lg focus:border-teal-400/50 outline-none"
                  placeholder="Case facts (e.g. Compensation for sand mining ban)..."
                />
                <button 
                  onClick={handleAISearch} 
                  className="absolute right-3 top-3 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-teal-600 transition"
                >
                  {isSearching ? <Loader2 className="animate-spin" /> : "Analyze"}
                </button>
              </div>

              <AnimatePresence>
                {showResult && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-slate-50 rounded-3xl p-8 border border-slate-200">
                    <div className="flex items-center gap-2 mb-6">
                      <CheckCircle2 size={18} className="text-teal-500"/> 
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Jurisprudence Complete</span>
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium text-sm">
                      {aiResponse}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${active ? 'bg-teal-500 text-white shadow-lg font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon} <span className="text-sm">{label}</span>
    </button>
  );
}

function DashboardCard({ title, icon, children }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        {icon}
      </div>
      {children}
    </div>
  );
}