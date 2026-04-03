import React, { useState, useEffect } from "react";
import { Search, Plus, Calculator, FileText, AlertTriangle, X } from "lucide-react";
import { INITIAL_CHEMICALS, API_754_SECTIONS, DOCUMENTS } from "../data/data";
import type { Chemical } from "../types/types";

const StandardsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState("api");
  const [chemSearch, setChemSearch] = useState("");
  
  // --- LOGIQUE DE GESTION DES PRODUITS ---
  const [chemicals, setChemicals] = useState<Chemical[]>(() => {
    const saved = localStorage.getItem("psevo_chemicals");
    return saved ? JSON.parse(saved) : INITIAL_CHEMICALS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChem, setNewChem] = useState<Chemical>({ 
    name: "", cas: "", tq1: 0, tq2: 0, hazard: 1 
  });

  const handleAddChemical = () => {
    if (!newChem.name || !newChem.cas) return;
    const updated = [newChem, ...chemicals];
    setChemicals(updated);
    localStorage.setItem("psevo_chemicals", JSON.stringify(updated));
    setIsModalOpen(false);
    setNewChem({ name: "", cas: "", tq1: 0, tq2: 0, hazard: 1 });
  };

  const filteredChemicals = chemicals.filter(c =>
    c.name.toLowerCase().includes(chemSearch.toLowerCase()) || c.cas.includes(chemSearch)
  );

  return (
    <div className="flex flex-col h-full bg-[#F0F4F8] font-sans">
      {/* Header Statut */}
      <div className="bg-white border-b border-[#E2E8F0] px-8 py-6 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#E8321A] mb-1">PSEVO ENGINE</p>
          <h1 className="text-3xl font-black uppercase text-[#0F1923]">Standards & Safety Hub</h1>
        </div>
        
        {activeTab === "chemicals" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0F1923] text-white flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-widest hover:bg-[#E8321A] transition-all"
          >
            <Plus size={14} /> Add Substance
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#E2E8F0] px-8 flex gap-8">
        {["api", "chemicals", "docs"].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === tab ? "border-[#E8321A] text-[#0F1923]" : "border-transparent text-gray-400"
            }`}
          >
            {tab === "api" ? "API 754 Rules" : tab === "chemicals" ? "Chemical Thresholds" : "Documentation"}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        
        {activeTab === "chemicals" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-6 relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="SEARCH CAS OR NAME..." 
                className="w-full bg-white border border-gray-200 py-2 pl-10 pr-4 text-[11px] font-bold outline-none focus:border-[#E8321A]"
                onChange={(e) => setChemSearch(e.target.value)}
              />
            </div>

            <div className="bg-white border-2 border-[#0F1923] shadow-[4px_4px_0px_#0F1923]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0F1923] text-white text-[9px] font-black uppercase tracking-widest">
                    <th className="p-4">Substance</th>
                    <th className="p-4">CAS Number</th>
                    <th className="p-4">TQ Tier 1 (kg)</th>
                    <th className="p-4">TQ Tier 2 (kg)</th>
                    <th className="p-4 text-right">Hazard Cat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChemicals.map((c, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-[12px] font-black text-[#0F1923]">{c.name}</td>
                      <td className="p-4 text-[11px] font-mono text-gray-500">{c.cas}</td>
                      <td className="p-4 text-[12px] font-black text-[#E8321A]">{c.tq1}</td>
                      <td className="p-4 text-[12px] font-black text-[#F59E0B]">{c.tq2}</td>
                      <td className="p-4 text-right">
                        <span className="bg-gray-100 px-2 py-1 text-[9px] font-black rounded-sm">CAT {c.hazard}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- MODAL D'AJOUT --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#0F1923]/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white w-full max-w-md border-4 border-[#0F1923] shadow-[12px_12px_0px_#E8321A] p-8 animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter">New Substance</h2>
                <button onClick={() => setIsModalOpen(false)}><X size={24}/></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Chemical Identity</label>
                  <input 
                    className="w-full border-2 border-gray-100 p-3 mt-1 text-[12px] font-bold outline-none focus:border-[#0F1923]"
                    placeholder="Name (e.g. Methanol)"
                    onChange={e => setNewChem({...newChem, name: e.target.value})}
                  />
                </div>
                <input 
                  className="w-full border-2 border-gray-100 p-3 text-[12px] font-bold outline-none focus:border-[#0F1923]"
                  placeholder="CAS Number (e.g. 67-56-1)"
                  onChange={e => setNewChem({...newChem, cas: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" placeholder="TQ Tier 1 (kg)"
                    className="w-full border-2 border-gray-100 p-3 text-[12px] font-bold"
                    onChange={e => setNewChem({...newChem, tq1: Number(e.target.value)})}
                  />
                  <input 
                    type="number" placeholder="TQ Tier 2 (kg)"
                    className="w-full border-2 border-gray-100 p-3 text-[12px] font-bold"
                    onChange={e => setNewChem({...newChem, tq2: Number(e.target.value)})}
                  />
                </div>
              </div>

              <button 
                onClick={handleAddChemical}
                className="w-full bg-[#0F1923] text-white py-4 mt-8 font-black uppercase tracking-[0.2em] hover:bg-[#E8321A] transition-all"
              >
                Confirm & Register
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardsView;