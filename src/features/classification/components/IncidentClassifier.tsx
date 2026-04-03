// ─────────────────────────────────────────────────────────────────────────────
// components/IncidentClassifier.tsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, createRef, useEffect } from "react";
import {
  Shield, Search, Building2, Users, Leaf,
  CheckCircle, AlertTriangle, ChevronRight, RotateCcw,
} from "lucide-react";
import { QUESTIONS, STEPS_META } from "../data/Questions";
import type { Step } from "../data/Questions";
import { useClassifier } from "../hooks/useClassifier";
import QuestionCard from "./QuestionCard";
import StepItem from "./StepItem";
import ResultScreen from "./ResultScreen";

// ─── Step icon map ────────────────────────────────────────────────────────────

const STEP_ICONS: Record<Step | "FINAL", React.ReactNode> = {
  STEP_1:  <Search size={14} />,
  STEP_2A: <Users size={14} />,
  STEP_2B: <Building2 size={14} />,
  STEP_3:  <AlertTriangle size={14} />,
  STEP_4:  <Leaf size={14} />,
  FINAL:   <CheckCircle size={14} />,
};

// ─── Component ────────────────────────────────────────────────────────────────

const IncidentClassifier: React.FC = () => {
  const {
    sessionId, activeIndex, answers, result, report,
    startedAt, handleAnswer, reset, hasDraft, answeredCount,
  } = useClassifier();

  const cardRefs = useRef<Record<number, React.RefObject<HTMLDivElement | null>>>(
    Object.fromEntries(QUESTIONS.map((q) => [q.id, createRef<HTMLDivElement>()]))
  );

  // Scroll to newly activated question
  useEffect(() => {
    const q = QUESTIONS[activeIndex];
    if (!q || answeredCount === 0) return;
    setTimeout(() => {
      cardRefs.current[q.id]?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, [activeIndex]);

  const currentQuestion = QUESTIONS[activeIndex];
  const activeStep: Step | "FINAL" = result ? "FINAL" : currentQuestion?.step ?? "STEP_1";

  const progressColor =
    result === "TIER_1" ? "#E8321A" :
    result === "TIER_2" ? "#F59E0B" :
    "#3B6FD4";
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);

  return (
    <div
      className="flex flex-col h-full bg-[#F0F4F8] text-[#0F1923] overflow-hidden text-[13px]"
      style={{ fontFamily: "'Barlow', sans-serif" }}
    >
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        <aside className="w-[268px] flex-shrink-0 flex flex-col bg-white border-r border-[#E2E8F0]">

          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-[#E2E8F0]">
            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-[#E8321A] rounded-sm">
              <Shield size={17} fill="white" stroke="none" />
            </div>
            <div>
              <p
                className="text-[12px] font-black uppercase tracking-[0.1em] text-[#0F1923]"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Incident Classifier
              </p>
              <p className="text-[9px] text-[#9BAABB] tracking-wide font-mono">
                PSEVO · PSE Decision Tree
              </p>
            </div>
          </div>

          {/* Session ID strip */}
          <div className="px-5 py-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <p className="text-[8px] font-mono text-[#CBD5E1] truncate">
              Session: {sessionId.slice(0, 20)}…
            </p>
          </div>

          {/* Progress bar */}
          <div className="px-5 py-3 border-b border-[#E2E8F0]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#9BAABB]">
                Progress
              </span>
              <span className="text-[9px] font-black" style={{ color: progressColor }}>
                {progress}%
              </span>
            </div>
            <div className="h-1.5 bg-[#F0F4F8] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: progressColor }}
              />
            </div>
          </div>

          {/* Steps navigation */}
          <div className="pt-1 flex-1 overflow-y-auto">
            {STEPS_META.map((stepMeta) => {
              const stepAnswered = stepMeta.questionIds.filter((id) => id in answers).length;
              const isDone =
                stepMeta.key !== "FINAL" &&
                stepMeta.questionIds.length > 0 &&
                stepMeta.questionIds.every((id) => id in answers) &&
                activeStep !== stepMeta.key;

              return (
                <StepItem
                  key={stepMeta.key}
                  icon={STEP_ICONS[stepMeta.key]}
                  label={stepMeta.label}
                  active={activeStep === stepMeta.key}
                  done={isDone || (stepMeta.key === "FINAL" && !!result)}
                  questionCount={stepMeta.questionIds.length}
                  answeredCount={stepAnswered}
                />
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-mono text-[#CBD5E1]">
                {new Date(startedAt).toLocaleTimeString("en-GB")}
              </p>
              <span className="text-[8px] font-black uppercase tracking-[0.15em] text-[#9BAABB]">
                {answeredCount} / {QUESTIONS.length}
              </span>
            </div>
          </div>
        </aside>

        {/* ── MAIN ──────────────────────────────────────────────────────────── */}
        <main className="flex flex-1 overflow-hidden">

          {/* CENTER SCROLL */}
          <div
            className="flex-1 overflow-y-auto p-8 flex flex-col gap-4"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 transparent" }}
          >
            {!result ? (
              <>
                {/* Draft resume banner */}
                {hasDraft && (
                  <div className="flex items-center gap-3 p-3 bg-[#3B6FD4]/10 border border-[#3B6FD4]/30 rounded-sm">
                    <RotateCcw size={14} className="text-[#3B6FD4] flex-shrink-0" />
                    <p className="text-[10px] font-bold text-[#3B6FD4] flex-1">
                      Previous session restored. You are resuming where you left off.
                    </p>
                    <button
                      onClick={reset}
                      className="text-[9px] font-black uppercase tracking-[0.1em] text-[#9BAABB] hover:text-[#E8321A] transition-colors"
                    >
                      Restart
                    </button>
                  </div>
                )}

                {/* Page title */}
                <div className="mb-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#E8321A] mb-2">
                    PSEVO Engine · Active Session
                  </p>
                  <h1
                    className="text-[30px] font-black uppercase leading-none tracking-tight text-[#0F1923] mb-2"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    PSE Classification
                  </h1>
                  <div className="w-10 h-[3px] bg-[#E8321A] rounded-full" />
                </div>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 flex-wrap">
                  {STEPS_META.filter((s) => s.key !== "FINAL").map((s, i, arr) => (
                    <React.Fragment key={s.key}>
                      <span
                        className={[
                          "text-[9px] font-bold uppercase tracking-[0.12em]",
                          activeStep === s.key
                            ? "text-[#E8321A]"
                            : s.questionIds.some((id) => id in answers)
                            ? "text-[#3B6FD4]"
                            : "text-[#CBD5E1]",
                        ].join(" ")}
                      >
                        {s.label.split("·")[1]?.trim() ?? s.label}
                      </span>
                      {i < arr.length - 1 && (
                        <ChevronRight size={10} className="text-[#E2E8F0] flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Status panel + Questions */}
                <div className="flex gap-5 items-start">

                  {/* Status panel */}
                  <div className="w-44 flex-shrink-0 bg-white border border-[#E2E8F0] rounded-sm shadow-sm overflow-hidden sticky top-4">
                    <div className="h-[3px] bg-[#3B6FD4]" />
                    <div className="p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#3B6FD4] mb-1">
                        Status
                      </p>
                      <p
                        className="text-[17px] font-black leading-snug mb-4 text-[#0F1923]"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                      >
                        Awaiting<br />Validation
                      </p>

                      <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#9BAABB] mb-3">
                        Verification Logs
                      </p>
                      <div className="space-y-2">
                        {[
                          { label: "System ready",      active: true },
                          { label: "Data initialised",  active: answeredCount > 0 },
                          { label: "Sequence active",   active: answeredCount >= 2 },
                          { label: "Deep analysis",     active: answeredCount >= 5 },
                        ].map(({ label, active }) => (
                          <div
                            key={label}
                            className={[
                              "flex items-center gap-2 text-[10px] transition-colors",
                              active ? "text-[#334155]" : "text-[#CBD5E1]",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "w-1.5 h-1.5 flex-shrink-0 rounded-full transition-colors",
                                active ? "bg-[#22C55E]" : "bg-[#CBD5E1]",
                              ].join(" ")}
                            />
                            {label}
                          </div>
                        ))}
                      </div>

                      {/* Phase dots */}
                      <div className="mt-5 pt-4 border-t border-[#F0F4F8]">
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#9BAABB] mb-2">
                          Phase
                        </p>
                        <div className="flex gap-1">
                          {(["STEP_1", "STEP_2A", "STEP_2B", "STEP_3", "STEP_4"] as const).map((s) => (
                            <div
                              key={s}
                              className={[
                                "flex-1 h-1 rounded-full transition-all duration-300",
                                activeStep === s
                                  ? "bg-[#E8321A]"
                                  : STEPS_META.find((m) => m.key === s)?.questionIds.some(
                                      (id) => id in answers
                                    )
                                  ? "bg-[#3B6FD4]"
                                  : "bg-[#E2E8F0]",
                              ].join(" ")}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Questions stack */}
                  <div className="flex-1 flex flex-col gap-4">
                    {QUESTIONS.map((q, idx) => {
                      const isAnswered = q.id in answers;
                      const isActive   = idx === activeIndex;
                      if (!isAnswered && !isActive) return null;
                      return (
                        <QuestionCard
                          key={q.id}
                          question={q}
                          active={isActive}
                          answered={isAnswered}
                          answerLabel={answers[q.id]}
                          onAnswer={handleAnswer}
                          cardRef={cardRefs.current[q.id]}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              report && (
                <ResultScreen result={result} report={report} onReset={reset} />
              )
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="w-[200px] flex-shrink-0 flex flex-col bg-white border-l border-[#E2E8F0]">

            {/* Active thread */}
            <div className="p-4 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E8321A]">
                  Active Thread
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8321A] animate-pulse" />
              </div>
              <p
                className="text-[13px] font-black text-[#0F1923]"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                26.0 Version
              </p>
              <p className="text-[8px] text-[#9BAABB] font-mono mt-0.5">Operational Site</p>
            </div>

            {/* Event log */}
            <div className="p-4 flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9BAABB] mb-3">
                Event Log
              </p>
              {answeredCount === 0 ? (
                <p className="text-[9px] text-[#CBD5E1] italic">Awaiting first input…</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {QUESTIONS.filter((q) => q.id in answers).map((q) => (
                    <div key={q.id} className="flex items-start gap-2">
                      <span
                        className={[
                          "w-1 h-1 rounded-full flex-shrink-0 mt-1.5",
                          answers[q.id] === "YES" ? "bg-[#E8321A]" : "bg-[#3B6FD4]",
                        ].join(" ")}
                      />
                      <div>
                        <p
                          className={[
                            "text-[9px] font-black font-mono",
                            answers[q.id] === "YES" ? "text-[#E8321A]" : "text-[#3B6FD4]",
                          ].join(" ")}
                        >
                          Q{q.validation} · {answers[q.id]}
                        </p>
                        <p className="text-[8px] text-[#9BAABB] leading-tight mt-0.5">
                          {q.title.length > 42 ? q.title.slice(0, 42) + "…" : q.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session ID footer */}
            <div className="p-4 border-t border-[#E2E8F0]">
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#9BAABB] mb-1">
                Session ID
              </p>
              <p className="text-[8px] font-mono text-[#CBD5E1] break-all">
                {sessionId.slice(0, 18)}…
              </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default IncidentClassifier;