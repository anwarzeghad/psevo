import React from "react";
import type { Question } from "../data/Questions";

interface QuestionCardProps {
  question: Question;
  active: boolean;
  answered: boolean;
  answerLabel?: string;
  onAnswer: (nextId: number | string, label: string) => void;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  active,
  answered,
  answerLabel,
  onAnswer,
  cardRef,
}) => {
  const chosenYes = answered && answerLabel === "OUI";
  

  const borderStyle = answered
    ? { borderColor: chosenYes ? "rgba(232,50,26,0.4)" : "rgba(59,111,212,0.3)" }
    : {};

  return (
    <div
      ref={cardRef}
      style={borderStyle}
      className={[
        "border bg-white rounded-sm transition-all duration-300",
        active
          ? "border-[#E2E8F0] shadow-[0_4px_20px_rgba(15,25,35,0.08)]"
          : answered
          ? "border-[#E2E8F0]"
          : "border-[#E2E8F0] opacity-35 pointer-events-none select-none",
      ].join(" ")}
    >
      {/* Active top accent */}
      {active && <div className="h-[3px] bg-[#E8321A] rounded-t-sm" />}
      {answered && (
        <div
          className={[
            "h-[2px] rounded-t-sm",
            chosenYes ? "bg-[#E8321A]/40" : "bg-[#3B6FD4]/40",
          ].join(" ")}
        />
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <span
              className={[
                "text-[8px] font-black uppercase tracking-[0.28em] px-2 py-1 rounded-sm",
                active
                  ? "bg-[#E8321A]/10 text-[#E8321A]"
                  : answered
                  ? "bg-[#3B6FD4]/10 text-[#3B6FD4]"
                  : "bg-[#F0F4F8] text-[#9BAABB]",
              ].join(" ")}
            >
              {question.stepLabel}
            </span>
            <span className="text-[8px] font-mono font-bold text-[#CBD5E1]">
              #{question.validation}
            </span>
          </div>

          {answered && (
            <span
              className={[
                "text-[8px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded-sm flex-shrink-0",
                chosenYes
                  ? "bg-[#E8321A]/10 text-[#E8321A]"
                  : "bg-[#3B6FD4]/10 text-[#3B6FD4]",
              ].join(" ")}
            >
              ✓ {answerLabel}
            </span>
          )}
        </div>

        {/* Question text */}
        <h3
          className="text-[20px] font-black leading-snug mb-2"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            color: active ? "#0F1923" : answered ? "#334155" : "#94A3B8",
          }}
        >
          {question.title}
        </h3>

        {/* Description */}
        {question.description && (
          <p className="text-[11px] text-[#0F1923] leading-relaxed mb-5 max-w-xl">
            {question.description}
          </p>
        )}

        {/* Options */}
        {!answered && (
          <div className="grid grid-cols-2 gap-3 mt-5">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => onAnswer(opt.nextId, opt.label)}
                className={[
                  "group flex flex-col items-center justify-center gap-1 py-5 px-4",
                  "border rounded-sm transition-all duration-150",
                  idx === 0
                    ? "bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#E8321A] hover:border-[#E8321A] hover:text-white text-[#0F1923]"
                    : "bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#3B6FD4] hover:border-[#3B6FD4] hover:text-white text-[#0F1923]",
                ].join(" ")}
              >
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#9BAABB] group-hover:text-white/70 transition-colors">
                  {idx === 0 ? "Option A" : "Option B"}
                </span>
                <span
                  className="text-[18px] font-black tracking-wider"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {opt.label}
                </span>
                {opt.sublabel && (
                  <span className="text-[8px] text-[#9BAABB] group-hover:text-white/60 transition-colors text-center leading-tight">
                    {opt.sublabel}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;