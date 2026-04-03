import React from "react";
import { Shield, AlertTriangle, XCircle, Search, Download, Printer } from "lucide-react";
import type { Result } from "../data/Questions";
import type { Report } from "../types/Report";
import { exportReportAsJSON } from "../services/storage";
import PrintableReport from "./PrintableReport"; 
interface ResultScreenProps {
  result: Result;
  report: Report;
  onReset: () => void;
}

const RESULT_CONFIG: Record<Result, {
  icon: React.ReactNode;
  iconBg: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  cta?: string;
}> = {
  TIER_1: {
    icon:       <Shield size={36} fill="white" stroke="none" />,
    iconBg:     "bg-[#E8321A]",
    badge:      "PSE TIER 1",
    badgeColor: "text-[#E8321A]",
    title:      "TIER 1",
    subtitle:   "Major process safety event. Immediate notification and investigation required.",
  },
  TIER_2: {
    icon:       <AlertTriangle size={36} className="text-white" />,
    iconBg:     "bg-[#F59E0B]",
    badge:      "PSE TIER 2",
    badgeColor: "text-[#F59E0B]",
    title:      "TIER 2",
    subtitle:   "Process safety incident. Formal investigation and report required.",
  },
  NOT_PSE: {
    icon:       <XCircle size={36} className="text-white" />,
    iconBg:     "bg-[#9BAABB]",
    badge:      "NOT A PSE INCIDENT",
    badgeColor: "text-[#9BAABB]",
    title:      "Not PSE",
    subtitle:   "This event does not meet the criteria for a PSE Tier 1 or Tier 2 incident.",
  },
  CHECK_THRESHOLD: {
    icon:       <Search size={36} className="text-white" />,
    iconBg:     "bg-[#3B6FD4]",
    badge:      "THRESHOLD CHECK REQUIRED",
    badgeColor: "text-[#3B6FD4]",
    title:      "Check Threshold",
    subtitle:   "Consult the mass/quantity threshold table to determine the final classification (Tier 1, Tier 2 or Tier 3).",
    cta:        "Open Threshold Table",
  },
};

function formatDuration(s: number): string {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}min ${s % 60}s`;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ result, report, onReset }) => {
  const cfg = RESULT_CONFIG[result];

  return (
    <>
      {/* 2. Ajout de la classe "print:hidden" pour cacher l'UI sur le PDF */}
      <div className="flex flex-col items-center justify-center text-center py-12 px-8 flex-1 print:hidden">

        {/* Icon */}
        <div className={`w-20 h-20 rounded-sm flex items-center justify-center mb-6 shadow-lg ${cfg.iconBg}`}>
          {cfg.icon}
        </div>

        {/* Badge */}
        <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-3 ${cfg.badgeColor}`}>
          Final Classification · {cfg.badge}
        </p>

        {/* Title */}
        <h2
          className="text-[52px] font-black leading-none tracking-tight text-[#0F1923] mb-4"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {cfg.title}
        </h2>

        {/* Subtitle */}
        <p className="text-[13px] text-[#9BAABB] max-w-md leading-relaxed mb-8">
          {cfg.subtitle}
        </p>

        {/* Stats strip */}
        <div className="flex items-stretch mb-8 bg-white border border-[#E2E8F0] rounded-sm overflow-hidden w-full max-w-sm">
          {[
            { label: "Questions", value: `${report.verdict.answeredQuestions}/${report.verdict.totalQuestions}` },
            { label: "Duration",  value: formatDuration(report.session.durationSeconds) },
            { label: "Analyst",   value: report.user.name.split(" ")[1] ?? report.user.name },
          ].map(({ label, value }, i) => (
            <div
              key={label}
              className={["flex-1 px-4 py-3 text-center", i > 0 ? "border-l border-[#E2E8F0]" : ""].join(" ")}
            >
              <p
                className="text-[18px] font-black text-[#0F1923]"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {value}
              </p>
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#9BAABB]">{label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {cfg.cta && (
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#3B6FD4] text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-sm hover:bg-[#2F5DB8] transition-colors">
              {cfg.cta}
            </button>
          )}
          <button
            onClick={() => exportReportAsJSON(report)}
            className="flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] text-[#9BAABB] text-[10px] font-black uppercase tracking-[0.15em] rounded-sm hover:text-[#3B6FD4] hover:border-[#3B6FD4] transition-colors"
          >
            <Download size={13} /> Export JSON
          </button>
          
          {/* Bouton Print amélioré */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] text-[#9BAABB] text-[10px] font-black uppercase tracking-[0.15em] rounded-sm hover:text-[#0F1923] hover:border-[#CBD5E1] transition-colors"
          >
            <Printer size={13} /> Print
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0F1923] text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-sm hover:bg-[#E8321A] transition-all duration-200"
          >
            New Analysis
          </button>
        </div>

        <p className="text-[8px] font-mono text-[#CBD5E1] mt-8">Report ID: {report.id}</p>
      </div>

      {/* 3. Affiche le rapport imprimable (caché à l'écran, visible au Print) */}
      <PrintableReport report={report} />
    </>
  );
};

export default ResultScreen;