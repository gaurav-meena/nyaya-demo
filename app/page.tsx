"use client";
import React, { useState } from 'react';
import { Scale, Shield, Search, Mail, FileText, Zap, ChevronRight, Loader2, Gavel, LayoutDashboard, Plus, Save, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NyayaAI() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [currentNote, setCurrentNote] = useState("");

  const handleSimulatedSearch = () => {
    setIsSearching(true);
    setShowResult(false);
    setTimeout(() => {
      setIsSearching(false);
      setShowResult(true);
    }, 2000);
  };

  const addNote = () => {
    if (currentNote) {
      setNotes([currentNote, ...notes]);
      setCurrentNote("");
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
          <div>
            <span className="text-2xl font-bold tracking-tight block">Nyaya<span className="text-teal-400 text-3xl">.</span>ai</span>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={20}/> <span>Command Center</span>
          </button>
          <button onClick={() => setActiveTab('research')} className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all ${activeTab === 'research' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Zap size={20}/> <span>Deep Research</span>
          </button>
          <button onClick={() => setActiveTab('filing')} className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all ${activeTab === 'filing' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Gavel size={20}/> <span>E-Filing Portal</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-800/50">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2 text-center">Identity Verified</p>
            <p className="text-sm font-medium text-center truncate">Adv. Gaurav Meena</p>
          </div>
        </div>
      </aside>

      {/* Main App Content */}
      <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-12">
        
        {/* VIEW 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <header className="mb-12">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Morning, Counsel.</h1>
              <p className="text-slate-500 mt-2 font-medium">System status: <span className="text-teal-600 font-bold">Encrypted & Live</span></p>
            </header>

            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl">Urgent Action Items</h3>
                  <Mail size={20} className="text-teal-500" />
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between group cursor-pointer hover:bg-red-100 transition">
                    <div>
                      <p className="text-sm font-bold text-red-900 underline decoration-red-300">Hearing Reminder: Suit #102</p>
                      <p className="text-xs text-red-700">Rajasthan HC - 10:30 AM</p>
                    </div>
                    <ChevronRight size={16} className="text-red-400" />
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-white transition">
                    <div>
                      <p className="text-sm font-bold">New E-mail from Registrar</p>
                      <p className="text-xs text-slate-500">Subject: Defect in Filing #229</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Mini Note Maker on Dashboard */}
              <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <Plus size={20} /> Quick Scratchpad
                </h3>
                <textarea 
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  className="w-full bg-slate-800 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-teal-500 mb-4 h-32"
                  placeholder="Jot down a case citation or argument point..."
                />
                <button onClick={addNote} className="w-full bg-teal-500 text-slate-900 font-bold py-2 rounded-xl text-sm hover:bg-teal-400 transition">
                  Save to Vault
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: RESEARCH MODULE */}
        {activeTab === 'research' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 mb-8">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <Search className="text-teal-500" /> Precedent Engine
                </h2>
                <div className="relative">
                  <input 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 px-8 text-lg focus:outline-none focus:border-teal-400/50"
                    placeholder="Describe your legal issue (e.g. Mandamus for Land Acquisition delay)..."
                  />
                  <button onClick={handleSimulatedSearch} className="absolute right-3 top-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-teal-600 transition">
                    Analyze
                  </button>
                </div>

                <AnimatePresence>
                  {isSearching && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 p-6 bg-teal-50 rounded-2xl flex items-center justify-center gap-4 text-teal-700">
                      <Loader2 className="animate-spin" /> <span className="text-xs font-bold uppercase tracking-widest">Cross-referencing Rajasthan HC Jurisprudence...</span>
                    </motion.div>
                  )}
                  {showResult && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 bg-slate-50 border border-slate-200 rounded-3xl p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 size={16} className="text-teal-500" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Legal Memo Generated</span>
                      </div>
                      <h3 className="text-xl font-bold mb-4">Writ of Mandamus: Land Acquisition Case Study</h3>
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        Under <span className="text-slate-900 font-bold">Article 226</span>, the High Court of Rajasthan has consistently held in <span className="italic">Kailash Chand vs. State</span> that delay in compensation payment warrants an immediate Mandamus. 
                      </p>
                      <div className="flex gap-4">
                        <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-teal-50 transition" onClick={() => setNotes(["Mandamus Case: Kailash Chand vs State - RTU 2021", ...notes])}>
                          <Save size={14}/> Save to Brief
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Saved Brief Section */}
              <div className="grid grid-cols-1 gap-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-4">Research Vault</h3>
                {notes.map((note, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">{note}</span>
                    <Clock size={14} className="text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: E-FILING MODULE */}
        {activeTab === 'filing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-2xl font-black mb-8">E-Filing Workflow Automation</h2>
              
              <div className="grid grid-cols-4 gap-4 mb-12">
                <FilingStep number="01" title="Drafting" status="complete" />
                <FilingStep number="02" title="Scanning" status="complete" />
                <FilingStep number="03" title="Court Fees" status="current" />
                <FilingStep number="04" title="Final Submit" status="pending" />
              </div>

              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                <div className="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <FileText className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Upload Legal Brief</h3>
                <p className="text-sm text-slate-500 mb-6">PDF Format (Max 50MB) - AI will auto-OCR the documents</p>
                <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition">Select Files</button>
              </div>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}

function FilingStep({ number, title, status }: { number: string, title: string, status: 'complete' | 'current' | 'pending' }) {
  const styles = {
    complete: "bg-teal-500 text-white",
    current: "bg-teal-100 text-teal-700 border-2 border-teal-500",
    pending: "bg-slate-100 text-slate-400"
  };
  return (
    <div className={`p-6 rounded-2xl text-center transition-all ${styles[status]}`}>
      <span className="text-[10px] font-black block mb-1">{number}</span>
      <span className="font-bold text-sm">{title}</span>
    </div>
  );
}