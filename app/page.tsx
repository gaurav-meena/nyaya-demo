"use client";
import React, { useState } from 'react';
import { Scale, Search, Mail, Zap, ChevronRight, Loader2, Gavel, LayoutDashboard, FileText, CheckCircle2, Clock, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NyayaAI() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [notes, setNotes] = useState<string[]>([]);

  // THE REAL AI LOGIC
  const handleAISearch = async () => {
    if (!userInput) return;
    setIsSearching(true);
    setShowResult(false);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `You are an elite Indian Legal Research Assistant. Context: Adv. Gaurav Meena, Rajasthan High Court. Task: Provide a professional legal summary, relevant sections of BNS/Evidence Act, and at least two case law citations for this query: ${userInput}. Keep it concise and professional.` }]
          }]
        })
      });

      const data = await response.json();
      const resultText = data.candidates[0].content.parts[0].text;
      setAiResponse(resultText);
      setShowResult(true);
    } catch (error) {
      setAiResponse("Error connecting to Legal Intelligence Server. Check API key.");
      setShowResult(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white p-8 flex flex-col shadow-2xl">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-teal-500 p-2.5 rounded-xl">
            <Scale size={28} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Nyaya.ai</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Command Center" />
          <TabButton active={activeTab === 'research'} onClick={() => setActiveTab('research')} icon={<Zap size={20}/>} label="Deep Research" />
          <TabButton active={activeTab === 'filing'} onClick={() => setActiveTab('filing')} icon={<Gavel size={20}/>} label="E-Filing Portal" />
        </nav>

        <div className="mt-auto p-4 rounded-2xl bg-slate-800/50 text-center">
           <p className="text-sm font-medium">Adv. Gaurav Meena</p>
           <p className="text-[10px] text-slate-400 uppercase">Rajasthan High Court</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-4xl font-black mb-8">Command Center</h1>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="font-bold text-xl mb-4">Urgent Correspondence</h3>
                <div className="p-4 bg-slate-50 rounded-xl flex justify-between items-center cursor-pointer hover:bg-slate-100 transition">
                  <p className="text-sm font-bold">Writ Petition #402: Status Update</p>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'research' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 mb-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Search className="text-teal-500" /> AI Legal Research</h2>
              <div className="relative">
                <input 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 px-8 text-lg focus:border-teal-400/50 transition-all outline-none"
                  placeholder="Enter legal issue or case facts..."
                />
                <button onClick={handleAISearch} className="absolute right-3 top-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-teal-600 transition">
                  {isSearching ? <Loader2 className="animate-spin" /> : "Ask AI"}
                </button>
              </div>

              <AnimatePresence>
                {showResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-slate-50 rounded-2xl p-8 border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 text-teal-600"><CheckCircle2 size={16}/> <span className="text-[10px] font-bold uppercase tracking-widest">Live Legal Analysis</span></div>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">{aiResponse}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeTab === 'filing' && (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
             <Gavel size={48} className="mx-auto text-slate-300 mb-4" />
             <h2 className="text-2xl font-bold">E-Filing Integration</h2>
             <p className="text-slate-500">Connecting to e-Courts India API...</p>
          </div>
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all ${active ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon} <span>{label}</span>
    </button>
  );
}