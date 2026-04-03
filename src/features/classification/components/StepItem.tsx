import React from "react";
import { Check } from "lucide-react";

interface StepItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  done: boolean;
  questionCount: number;
  answeredCount: number;
}

const StepItem: React.FC<StepItemProps> = ({
  icon, label, active, done, questionCount, answeredCount,
}) => (
  <div
    className={[
      "flex items-center gap-3 px-5 py-3 border-l-[3px] transition-all duration-200",
      active
        ? "border-[#E8321A] bg-[#E8321A]/[0.04] text-[#0F1923]"
        : done
        ? "border-[#3B6FD4]/50 text-[#3B6FD4]"
        : "border-transparent text-[#9BAABB]",
    ].join(" ")}
  >
    <span className="flex-shrink-0">{icon}</span>
    <span className="text-[10px] font-bold uppercase tracking-[0.15em] flex-1 leading-tight">
      {label}
    </span>
    {done && (
      <span className="w-4 h-4 rounded-full bg-[#3B6FD4] flex items-center justify-center flex-shrink-0">
        <Check size={9} strokeWidth={3} className="text-white" />
      </span>
    )}
    {active && questionCount > 0 && (
      <span className="text-[8px] font-black text-[#E8321A] flex-shrink-0">
        {answeredCount}/{questionCount}
      </span>
    )}
  </div>
);

export default StepItem;