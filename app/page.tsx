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

  // THE REFINED AI LOGIC
  const handleAISearch = async () => {
    if (!userInput) return;
    setIsSearching(true);
    setShowResult(false);

    // Vercel grabs this from your Environment Variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // DIAGNOSTIC CHECK: Is the key reaching the app?
    if (!apiKey) {
      setAiResponse("❌ CONFIG ERROR: The API Key is not being detected. \n\nPROCEDURAL STEPS TO FIX:\n1. Verify the name in Vercel is EXACTLY: NEXT_PUBLIC_GEMINI_API_KEY\n2. Ensure you clicked 'Save' in Vercel Settings.\n3. Run a Fresh Deployment (Redeploy) without using the Build Cache.");
      setShowResult(true);
      setIsSearching(false);
      return;
    }

    try {
      // UPDATED: Using gemini-1.5-flash-latest for 2026 compatibility
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
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
        setAiResponse(`❌ GOOGLE API ERROR: ${data.error.message}`);
      } else {
        const resultText = data.candidates[0].content.parts[0].text;
        setAiResponse(resultText);
      }
      setShowResult(true);
    } catch (error) {
      setAiResponse("❌ NETWORK ERROR: Could not reach the Legal Intelligence Server. Check your internet connection.");
      setShowResult(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      
      {/* SIDEBAR: Professional Branding */}
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

        <div className="mt-auto space-y-4">
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 p-12">
        
        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-10 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Morning, Counsel.</h1>
                <p className="text-slate-500 mt-2 font-medium">Gujarat National Law University Portal Connected</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-full border border-slate-200 text-[11px] font-bold text-slate-400 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> SYSTEM LIVE
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <DashboardCard title="Urgent from Registrar" icon={<Mail className="text-teal-500" />}>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 mb-3 flex justify-between items-center group cursor-pointer hover:bg-red-100 transition">
                  <span className="text-sm font-bold text-red-900 underline decoration-red-200">Supreme Court Clerk Exam: Update</span>
                  <ChevronRight size={16} className="text-red-400" />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-white transition">
                  <span className="text-sm font-medium">India-UAE BIT Dissertation: Draft Due</span>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </DashboardCard>
              
              <DashboardCard title="Active Briefs" icon={<FileText className="text-teal-500" />}>
                 <div className="text-center py-6">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">No Active Deadlines</p>
                    <button className="text-teal-600 text-xs font-bold hover:underline">Start New Filing +</button>
                 </div>
              </DashboardCard>
            </div>
          </motion.div>
        )}

        {/* RESEARCH VIEW */}
        {activeTab === 'research' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 mb-8">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Search className="text-teal-500" size={28} /> AI Precedent Engine
              </h2>
              <div className="relative group">
                <input 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 px-8 text-lg focus:border-teal-400/50 transition-all outline-none shadow-inner"
                  placeholder="Describe legal facts (e.g. Writ of Mandamus for land delay)..."
                />
                <button 
                  onClick={handleAISearch} 
                  disabled={isSearching}
                  className="absolute right-3 top-3 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-teal-600 transition shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="animate-spin" /> : "Analyze"}
                </button>
              </div>

              <AnimatePresence>
                {showResult && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-slate-50 rounded-3xl p-8 border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
                    <div className="flex items-center gap-2 mb-6">
                      <CheckCircle2 size={18} className="text-teal-500"/> 
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Jurisprudence Analysis Complete</span>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium text-sm">
                        {aiResponse}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* E-FILING VIEW */}
        {activeTab === 'filing' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-200 max-w-md">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Gavel size={32} className="text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-slate-900">E-Filing Portal</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">Secure integration with Rajasthan High Court e-Courts platform. Verified access only.</p>
                <div className="flex gap-4 items-center justify-center">
                   <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Connection Pending Verification</span>
                </div>
              </div>
           </motion.div>
        )}
      </main>
    </div>
  );
}

// Reusable Components
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${active ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon} <span className="text-sm tracking-tight">{label}</span>
    </button>
  );
}

function DashboardCard({ title, icon, children }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        {icon}
      </div>
      {children}
    </div>
  );
}