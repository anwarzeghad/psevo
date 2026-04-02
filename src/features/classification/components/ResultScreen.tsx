import React from "react";
import { Shield, AlertTriangle, XCircle, Search } from "lucide-react";
import type { Result } from "../data/Questions";

interface ResultScreenProps {
  result: Result;
  answeredCount: number;
  onReset: () => void;
}

const RESULT_CONFIG: Record<
  Result,
  {
    icon: React.ReactNode;
    iconBg: string;
    badge: string;
    badgeColor: string;
    title: string;
    subtitle: string;
    action?: string;
  }
> = {
  TIER_1: {
    icon: <Shield size={36} fill="white" stroke="none" />,
    iconBg: "bg-[#E8321A]",
    badge: "PSE TIER 1",
    badgeColor: "text-[#E8321A]",
    title: "TIER 1",
    subtitle: "Major process safety incident. Immediate notification required.",
    action: undefined,
  },
  TIER_2: {
    icon: <AlertTriangle size={36} className="text-white" />,
    iconBg: "bg-[#F59E0B]",
    badge: "PSE TIER 2",
    badgeColor: "text-[#F59E0B]",
    title: "TIER 2",
    subtitle: "Process safety incident. Investigation and report required.",
    action: undefined,
  },
  NOT_PSE: {
    icon: <XCircle size={36} className="text-white" />,
    iconBg: "bg-[#9BAABB]",
    badge: "NON CLASSIFIÉ PSE",
    badgeColor: "text-[#9BAABB]",
    title: "Not a PSE Incident",
    subtitle: "This event does not meet the criteria for a PSE Tier 1 or Tier 2 incident.",
    action: undefined,
  },
  CHECK_THRESHOLD: {
    icon: <Search size={36} className="text-white" />,
    iconBg: "bg-[#3B6FD4]",
    badge: "VÉRIFICATION REQUISE",
    badgeColor: "text-[#3B6FD4]",
    title: "Threshold Verification",
    subtitle: "The incident requires further analysis against specific thresholds to determine the final classification.",
    action: "View Thresholds",
  },
};

const ResultScreen: React.FC<ResultScreenProps> = ({ result, answeredCount, onReset }) => {
  const cfg = RESULT_CONFIG[result];

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-8 flex-1">

      {/* Icon */}
      <div className={`w-20 h-20 rounded-sm flex items-center justify-center mb-6 shadow-lg ${cfg.iconBg}`}>
        {cfg.icon}
      </div>

      {/* Badge */}
      <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-3 ${cfg.badgeColor}`}>
        Final classification.{cfg.badge}
      </p>

      {/* Title */}
      <h2
        className="text-[52px] font-black leading-none tracking-tight text-[#0F1923] mb-4"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {cfg.title}
      </h2>

      {/* Subtitle */}
      <p className="text-[13px] text-[#9BAABB] max-w-md leading-relaxed mb-10">
        {cfg.subtitle}
      </p>

      {/* Stats */}
<div className="flex items-center gap-6 mb-10 p-4 bg-white border border-[#E2E8F0] rounded-sm w-full max-w-xs">
  <div className="flex-1 text-center">
    <p className="text-[22px] font-black text-[#0F1923]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
      {answeredCount}
    </p>
    <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#9BAABB]">
      Questions answered
    </p>
  </div>
  <div className="w-px h-10 bg-[#E2E8F0]" />
  
</div>
      {/* Actions */}
      <div className="flex gap-3">
        {cfg.action && (
          <button className="px-6 py-2.5 bg-[#3B6FD4] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-[#2F5DB8] transition-colors">
            {cfg.action}
          </button>
        )}
        <button
          onClick={onReset}
          className="px-6 py-2.5 bg-[#0F1923] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-[#E8321A] transition-all duration-200"
        >
           New Classification
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;