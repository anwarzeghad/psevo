// ─────────────────────────────────────────────────────────────────────────────
// components/StandardsView.tsx — Safety Hub & Reference Library
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  ChevronDown, ChevronUp, Search, Calculator,
  FileText, ExternalLink, Info, AlertTriangle,
} from "lucide-react";

// ─── API 754 Accordion ───────────────────────────────────────────────────────

const API_754_SECTIONS = [
  {
    id: "definition",
    title: "What is a Process Safety Incident?",
    content: `A Process Safety Incident (PSI) is an unplanned or uncontrolled release of any material, including non-toxic and non-flammable materials, from a process that results in one or more of the consequences defined in API RP 754. The release must occur from a process that is part of the facility's defined process safety boundary.`,
  },
  {
    id: "tier1",
    title: "Tier 1 PSE Definition",
    content: `A Tier 1 PSE is an unplanned or uncontrolled release of any material from a process, including non-toxic and non-flammable materials, that results in one or more of the following consequences: (1) An employee, contractor, or subcontractor Days Away From Work (DAFW) injury or fatality; (2) A hospital admission or fatality of a third-party; (3) A fire or explosion resulting in ≥ $100,000 of damage; (4) An officially declared community evacuation or shelter-in-place; (5) A release exceeding the Tier 1 threshold quantity defined in Annex A.`,
  },
  {
    id: "tier2",
    title: "Tier 2 PSE Definition",
    content: `A Tier 2 PSE is an unplanned or uncontrolled release of any material from a process that results in one or more of the following consequences: (1) An employee, contractor, or subcontractor recordable injury; (2) A fire or explosion resulting in $2,500–$100,000 of damage; (3) A release exceeding the Tier 2 threshold quantity but not reaching Tier 1 thresholds.`,
  },
  {
    id: "boundary",
    title: "Process Safety Boundary",
    content: `The process safety boundary defines which equipment and areas are subject to PSE classification. Equipment typically inside the boundary includes: process vessels, heat exchangers, piping, pumps, compressors, fired heaters, and associated instrumentation. Storage tanks (fixed-roof, floating-roof) are included. Utility systems (steam, cooling water) are typically excluded unless they contain hazardous materials.`,
  },
  {
    id: "indoor",
    title: "Indoor vs. Outdoor Release Rules",
    content: `Releases inside an enclosed building are classified more severely. For indoor releases: (1) If adequate ventilation is not present, the threshold quantity is divided by 4. (2) If some ventilation exists, the threshold quantity is divided by 2. (3) If full ventilation equivalent to outdoor conditions is demonstrated, standard thresholds apply. This reflects the higher potential for vapor accumulation and ignition in confined spaces.`,
  },
  {
    id: "prd",
    title: "PRD / Safety System Releases",
    content: `Releases through a Pressure Relief Device (PRD), Safety Instrumented System (SIS), or emergency manual depressurization are treated separately. Such releases are first evaluated for environmental and public consequences (rainout, dangerous discharge locations, shelter-in-place, road closures). If any consequence applies, the release is evaluated against Tier 1/2 threshold quantities. If no consequence occurs, it is not classified as a PSE.`,
  },
];

const AccordionItem: React.FC<{
  title: string; content: string; open: boolean; onToggle: () => void;
}> = ({ title, content, open, onToggle }) => (
  <div className="border border-[#E2E8F0] rounded-sm overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-[#F8FAFC] transition-colors text-left"
    >
      <span className="text-[11px] font-black text-[#0F1923] uppercase tracking-[0.08em]">{title}</span>
      {open
        ? <ChevronUp size={14} className="text-[#E8321A] flex-shrink-0" />
        : <ChevronDown size={14} className="text-[#9BAABB] flex-shrink-0" />}
    </button>
    {open && (
      <div className="px-4 pb-4 pt-2 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <p className="text-[12px] text-[#334155] leading-relaxed">{content}</p>
      </div>
    )}
  </div>
);

// ─── Chemical threshold table ─────────────────────────────────────────────────

const CHEMICALS = [
  { name: "Ammonia",          cas: "7664-41-7", tq1: 500,   tq2: 50,   hazard: 1 },
  { name: "Chlorine",         cas: "7782-50-5", tq1: 100,   tq2: 10,   hazard: 1 },
  { name: "Hydrogen Sulfide", cas: "7783-06-4", tq1: 500,   tq2: 50,   hazard: 1 },
  { name: "Benzene",          cas: "71-43-2",   tq1: 2000,  tq2: 200,  hazard: 2 },
  { name: "Methane",          cas: "74-82-8",   tq1: 5000,  tq2: 500,  hazard: 3 },
  { name: "Propane",          cas: "74-98-6",   tq1: 5000,  tq2: 500,  hazard: 3 },
  { name: "Ethylene",         cas: "74-85-1",   tq1: 5000,  tq2: 500,  hazard: 3 },
  { name: "Hydrofluoric Acid",cas: "7664-39-3", tq1: 100,   tq2: 10,   hazard: 1 },
  { name: "Sulfur Dioxide",   cas: "7446-09-5", tq1: 500,   tq2: 50,   hazard: 1 },
  { name: "Phosgene",         cas: "75-44-5",   tq1: 10,    tq2: 1,    hazard: 1 },
  { name: "Acrolein",         cas: "107-02-8",  tq1: 500,   tq2: 50,   hazard: 1 },
  { name: "Toluene",          cas: "108-88-3",  tq1: 10000, tq2: 1000, hazard: 4 },
  { name: "Methanol",         cas: "67-56-1",   tq1: 5000,  tq2: 500,  hazard: 3 },
  { name: "Hydrogen Cyanide", cas: "74-90-8",   tq1: 100,   tq2: 10,   hazard: 1 },
  { name: "Carbon Monoxide",  cas: "630-08-0",  tq1: 2000,  tq2: 200,  hazard: 2 },
];

const HAZARD_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "bg-[#E8321A]/10", text: "text-[#E8321A]", label: "Acute Toxic" },
  2: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", label: "Flammable Toxic" },
  3: { bg: "bg-[#3B6FD4]/10", text: "text-[#3B6FD4]", label: "Flammable" },
  4: { bg: "bg-[#9BAABB]/10", text: "text-[#9BAABB]", label: "Low Hazard" },
};

// ─── Pressure to Mass Calculator ─────────────────────────────────────────────

const PressureToMassCalc: React.FC = () => {
  const [pressure, setPressure] = useState("10");
  const [diameter, setDiameter] = useState("50");
  const [duration, setDuration] = useState("30");
  const [density, setDensity]   = useState("1.5");

  const orificeArea = Math.PI * Math.pow((parseFloat(diameter) / 1000) / 2, 2);
  const flowRate = parseFloat(density) * orificeArea * Math.sqrt(2 * parseFloat(pressure) * 1e5 / parseFloat(density));
  const mass = flowRate * parseFloat(duration) * 60;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={14} className="text-[#3B6FD4]" />
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#0F1923]">
          Release Mass Estimator
        </p>
      </div>
      <p className="text-[10px] text-[#9BAABB] mb-4 leading-relaxed">
        Simplified orifice model (API 520). For screening purposes only — use detailed simulation for final classification.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Upstream Pressure (bar g)", val: pressure, set: setPressure, unit: "bar" },
          { label: "Orifice Diameter (mm)",     val: diameter, set: setDiameter, unit: "mm"  },
          { label: "Release Duration (min)",     val: duration, set: setDuration, unit: "min" },
          { label: "Gas Density (kg/m³)",        val: density,  set: setDensity,  unit: "kg/m³" },
        ].map(({ label, val, set, unit }) => (
          <div key={label}>
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#9BAABB] mb-1">{label}</p>
            <div className="flex items-center border border-[#E2E8F0] rounded-sm overflow-hidden">
              <input
                type="number"
                value={val}
                onChange={e => set(e.target.value)}
                className="flex-1 px-3 py-2 text-[11px] font-bold text-[#0F1923] bg-[#F8FAFC] outline-none"
              />
              <span className="px-2 text-[9px] text-[#9BAABB] bg-[#F0F4F8] border-l border-[#E2E8F0] py-2">
                {unit}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#3B6FD4]/10 border border-[#3B6FD4]/30 rounded-sm p-4">
        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#3B6FD4] mb-1">
          Estimated Release Mass
        </p>
        <p className="text-[28px] font-black text-[#0F1923]"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          {isNaN(mass) || !isFinite(mass) ? "—" : `${mass.toFixed(0)} kg`}
        </p>
        <p className="text-[9px] text-[#9BAABB] mt-1">
          Flow rate: {isNaN(flowRate) ? "—" : `${flowRate.toFixed(2)} kg/s`}
        </p>
      </div>
    </div>
  );
};

// ─── Indoor / Outdoor rules ───────────────────────────────────────────────────

const IndoorOutdoorRules: React.FC = () => (
  <div className="bg-white border border-[#E2E8F0] rounded-sm p-5">
    <div className="flex items-center gap-2 mb-4">
      <Info size={14} className="text-[#F59E0B]" />
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#0F1923]">
        Indoor vs. Outdoor Release Rules
      </p>
    </div>
    <div className="flex flex-col gap-3">
      {[
        {
          scenario: "Outdoor Release",
          multiplier: "× 1.0",
          desc: "Standard threshold quantities apply. Adequate atmospheric dispersion assumed.",
          color: "#22C55E",
          bg: "bg-[#22C55E]/10",
        },
        {
          scenario: "Indoors — Ventilated",
          multiplier: "÷ 2",
          desc: "Threshold quantity is halved. Some ventilation present but below outdoor equivalence.",
          color: "#F59E0B",
          bg: "bg-[#F59E0B]/10",
        },
        {
          scenario: "Indoors — Unventilated",
          multiplier: "÷ 4",
          desc: "Threshold quantity is quartered. No adequate ventilation. Highest classification risk.",
          color: "#E8321A",
          bg: "bg-[#E8321A]/10",
        },
      ].map(({ scenario, multiplier, desc, color, bg }) => (
        <div key={scenario} className={`${bg} border rounded-sm p-3 flex gap-3`}
          style={{ borderColor: color + "30" }}>
          <div className="flex-shrink-0 text-center">
            <p className="text-[18px] font-black leading-none" style={{ color, fontFamily: "'Barlow Condensed', sans-serif" }}>
              {multiplier}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black text-[#0F1923] mb-0.5">{scenario}</p>
            <p className="text-[10px] text-[#334155] leading-snug">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── PDF Document list ────────────────────────────────────────────────────────

const DOCUMENTS = [
  { id: "PSE-PRO-01", title: "Incident Reporting Procedure",       rev: "Rev. 4", date: "Jan 2024" },
  { id: "PSE-PRO-02", title: "LOPC Classification Guideline",      rev: "Rev. 2", date: "Mar 2024" },
  { id: "PSE-PRO-03", title: "Emergency Response Plan",            rev: "Rev. 6", date: "Nov 2023" },
  { id: "PSE-PRO-04", title: "PRD Inspection & Testing Procedure", rev: "Rev. 3", date: "Feb 2024" },
  { id: "PSE-PRO-05", title: "Chemical Inventory Management",      rev: "Rev. 1", date: "Apr 2023" },
  { id: "API-754",    title: "API RP 754 — Process Safety Indicators", rev: "Ed. 2", date: "2016" },
  { id: "OSHA-PSM",  title: "OSHA 29 CFR 1910.119 — PSM Standard", rev: "Current", date: "—" },
];

// ─── StandardsView ────────────────────────────────────────────────────────────

const StandardsView: React.FC = () => {
  const [openAccordion, setOpenAccordion] = useState<string | null>("definition");
  const [chemSearch, setChemSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"api" | "chemicals" | "calc" | "docs">("api");

  const filteredChemicals = CHEMICALS.filter(c =>
    c.name.toLowerCase().includes(chemSearch.toLowerCase()) ||
    c.cas.includes(chemSearch)
  );

  return (
    <div className="flex flex-col h-full bg-[#F0F4F8]" style={{ fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex-shrink-0">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#E8321A] mb-1">
          PSEVO Engine · Reference Library
        </p>
        <h1 className="text-[26px] font-black uppercase leading-none tracking-tight text-[#0F1923]"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          Standards & Safety Hub
        </h1>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-[#E2E8F0] px-8 flex items-center gap-1 flex-shrink-0">
        {([
          { key: "api",       label: "API 754 Reference" },
          { key: "chemicals", label: "Chemical Thresholds" },
          { key: "calc",      label: "Calculators" },
          { key: "docs",      label: "Documentation" },
        ] as { key: typeof activeTab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={[
              "px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] border-b-2 transition-all",
              activeTab === key
                ? "border-[#E8321A] text-[#0F1923]"
                : "border-transparent text-[#9BAABB] hover:text-[#0F1923]",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>

        {/* API 754 */}
        {activeTab === "api" && (
          <div className="max-w-3xl flex flex-col gap-3">
            <div className="flex items-center gap-2 p-3 bg-[#3B6FD4]/10 border border-[#3B6FD4]/30 rounded-sm mb-2">
              <AlertTriangle size={13} className="text-[#3B6FD4] flex-shrink-0" />
              <p className="text-[10px] font-bold text-[#3B6FD4]">
                Quick reference based on API RP 754 (2nd Edition). Always consult the official standard for binding classification decisions.
              </p>
            </div>
            {API_754_SECTIONS.map(sec => (
              <AccordionItem
                key={sec.id}
                title={sec.title}
                content={sec.content}
                open={openAccordion === sec.id}
                onToggle={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)}
              />
            ))}
          </div>
        )}

        {/* Chemical thresholds */}
        {activeTab === "chemicals" && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9BAABB]" />
                <input
                  value={chemSearch}
                  onChange={e => setChemSearch(e.target.value)}
                  placeholder="Search chemical or CAS…"
                  className="bg-white border border-[#E2E8F0] rounded-sm pl-8 pr-4 py-2 text-[11px] font-mono text-[#334155] placeholder:text-[#CBD5E1] outline-none focus:border-[#3B6FD4] w-56 transition-colors"
                />
              </div>
              <p className="text-[9px] text-[#9BAABB]">{filteredChemicals.length} chemicals · API 754 Annex A</p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-sm overflow-hidden shadow-sm">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Chemical Name", "CAS Number", "TQ Tier 1 (kg)", "TQ Tier 2 (kg)", "Hazard"].map(h => (
                  <div key={h} className="px-4 py-2.5 text-[8px] font-black uppercase tracking-[0.18em] text-[#9BAABB]">
                    {h}
                  </div>
                ))}
              </div>
              {filteredChemicals.map((c, i) => {
                const hz = HAZARD_COLORS[c.hazard];
                return (
                  <div key={c.name}
                    className={["grid grid-cols-[2fr_1fr_1fr_1fr_1fr] border-b border-[#F0F4F8] last:border-0",
                      i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"].join(" ")}>
                    <div className="px-4 py-2.5">
                      <p className="text-[11px] font-bold text-[#0F1923]">{c.name}</p>
                    </div>
                    <div className="px-4 py-2.5 flex items-center">
                      <p className="text-[10px] font-mono text-[#9BAABB]">{c.cas}</p>
                    </div>
                    <div className="px-4 py-2.5 flex items-center">
                      <p className="text-[11px] font-black text-[#E8321A]">{c.tq1.toLocaleString()}</p>
                    </div>
                    <div className="px-4 py-2.5 flex items-center">
                      <p className="text-[11px] font-black text-[#F59E0B]">{c.tq2.toLocaleString()}</p>
                    </div>
                    <div className="px-4 py-2.5 flex items-center">
                      <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-sm ${hz.bg} ${hz.text}`}>
                        Cat. {c.hazard}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Calculators */}
        {activeTab === "calc" && (
          <div className="grid grid-cols-2 gap-5 max-w-4xl">
            <PressureToMassCalc />
            <IndoorOutdoorRules />
          </div>
        )}

        {/* Documentation */}
        {activeTab === "docs" && (
          <div className="max-w-2xl flex flex-col gap-3">
            <p className="text-[9px] text-[#9BAABB] mb-2">
              Internal procedures and regulatory references. Click to open or download.
            </p>
            {DOCUMENTS.map(doc => (
              <div key={doc.id}
                className="bg-white border border-[#E2E8F0] rounded-sm p-4 flex items-center gap-4 hover:border-[#3B6FD4]/40 hover:shadow-sm transition-all cursor-pointer group">
                <div className="w-10 h-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm flex items-center justify-center flex-shrink-0 group-hover:bg-[#3B6FD4]/10 transition-colors">
                  <FileText size={16} className="text-[#9BAABB] group-hover:text-[#3B6FD4]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black font-mono text-[#E8321A] mb-0.5">{doc.id}</p>
                  <p className="text-[12px] font-bold text-[#0F1923] truncate">{doc.title}</p>
                  <p className="text-[9px] text-[#9BAABB]">{doc.rev} · {doc.date}</p>
                </div>
                <ExternalLink size={14} className="text-[#CBD5E1] group-hover:text-[#3B6FD4] flex-shrink-0 transition-colors" />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default StandardsView;