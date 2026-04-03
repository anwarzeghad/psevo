// ─────────────────────────────────────────────────────────────────────────────
// components/ResultScreen.tsx
// Includes a hidden #print-zone div that renders as a clean PDF
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Shield, AlertTriangle, XCircle, Search, Download, Printer } from "lucide-react";
import type { Result } from "../data/Questions";
import type { Report } from "../types/Report";
import { exportReportAsJSON } from "../services/storage";

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
  borderColor: string;
  title: string;
  subtitle: string;
  cta?: string;
}> = {
  TIER_1: {
    icon: <Shield size={36} fill="white" stroke="none" />,
    iconBg: "bg-[#E8321A]",
    badge: "PSE TIER 1",
    badgeColor: "text-[#E8321A]",
    borderColor: "#E8321A",
    title: "TIER 1",
    subtitle: "Major process safety event. Immediate notification and investigation required.",
  },
  TIER_2: {
    icon: <AlertTriangle size={36} className="text-white" />,
    iconBg: "bg-[#F59E0B]",
    badge: "PSE TIER 2",
    badgeColor: "text-[#F59E0B]",
    borderColor: "#F59E0B",
    title: "TIER 2",
    subtitle: "Process safety incident. Formal investigation and report required.",
  },
  NOT_PSE: {
    icon: <XCircle size={36} className="text-white" />,
    iconBg: "bg-[#9BAABB]",
    badge: "NOT A PSE INCIDENT",
    badgeColor: "text-[#9BAABB]",
    borderColor: "#9BAABB",
    title: "Not PSE",
    subtitle: "This event does not meet the criteria for a PSE Tier 1 or Tier 2 incident.",
  },
  CHECK_THRESHOLD: {
    icon: <Search size={36} className="text-white" />,
    iconBg: "bg-[#3B6FD4]",
    badge: "THRESHOLD CHECK REQUIRED",
    badgeColor: "text-[#3B6FD4]",
    borderColor: "#3B6FD4",
    title: "Check Threshold",
    subtitle: "Consult the mass/quantity threshold table to determine the final classification (Tier 1, Tier 2 or Tier 3).",
    cta: "Open Threshold Table",
  },
};

function formatDuration(s: number): string {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}min ${s % 60}s`;
}

function formatDateFull(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZone: "UTC", timeZoneName: "short",
  });
}

const ResultScreen: React.FC<ResultScreenProps> = ({ result, report, onReset }) => {
  const cfg = RESULT_CONFIG[result];

  return (
    <>
      {/* ── SCREEN VIEW ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center text-center py-12 px-8 flex-1 print:hidden">

        <div className={`w-20 h-20 rounded-sm flex items-center justify-center mb-6 shadow-lg ${cfg.iconBg}`}>
          {cfg.icon}
        </div>

        <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-3 ${cfg.badgeColor}`}>
          Final Classification · {cfg.badge}
        </p>

        <h2 className="text-[52px] font-black leading-none tracking-tight text-[#0F1923] mb-4"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          {cfg.title}
        </h2>

        <p className="text-[13px] text-[#9BAABB] max-w-md leading-relaxed mb-8">{cfg.subtitle}</p>

        {/* Stats strip */}
        <div className="flex items-stretch mb-8 bg-white border border-[#E2E8F0] rounded-sm overflow-hidden w-full max-w-sm">
          {[
            { label: "Questions", value: `${report.verdict.answeredQuestions}/${report.verdict.totalQuestions}` },
            { label: "Duration",  value: formatDuration(report.session.durationSeconds) },
            { label: "Analyst",   value: report.user.name.split(" ").pop() ?? report.user.name },
          ].map(({ label, value }, i) => (
            <div key={label} className={["flex-1 px-4 py-3 text-center", i > 0 ? "border-l border-[#E2E8F0]" : ""].join(" ")}>
              <p className="text-[18px] font-black text-[#0F1923]"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{value}</p>
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
          <button onClick={() => exportReportAsJSON(report)}
            className="flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] text-[#9BAABB] text-[10px] font-black uppercase tracking-[0.15em] rounded-sm hover:text-[#3B6FD4] hover:border-[#3B6FD4] transition-colors">
            <Download size={13} /> Export JSON
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] text-[#9BAABB] text-[10px] font-black uppercase tracking-[0.15em] rounded-sm hover:text-[#0F1923] hover:border-[#CBD5E1] transition-colors">
            <Printer size={13} /> Print Report
          </button>
          <button onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0F1923] text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-sm hover:bg-[#E8321A] transition-all duration-200">
            New Analysis
          </button>
        </div>
      </div>

      {/* ── PRINT-ONLY REPORT — shown when Ctrl+P ───────────────────────── */}
      {/*
        This div is hidden on screen but becomes the entire printed page.
        App.tsx injects @media print { body * { visibility: hidden } #print-zone { visibility: visible; position: fixed; inset: 0 } }
      */}
      <div id="print-zone" style={{ display: "none" }}>
        {/* Rendered by print CSS — see App.tsx */}
        <div style={{
          fontFamily: "'Barlow', 'Arial', sans-serif",
          color: "#0F1923",
          background: "white",
          padding: "32px 40px",
          maxWidth: "800px",
          margin: "0 auto",
        }}>

          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, borderBottom: "3px solid #E8321A", paddingBottom: 20 }}>
            <div>
              {/* Company name as text fallback (logo images don't print from localhost) */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, background: "#E8321A", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>
                  <span style={{ color: "white", fontWeight: 900, fontSize: 20, fontStyle: "italic" }}>P</span>
                </div>
                <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "0.18em", textTransform: "uppercase" }}>PSEVO</span>
              </div>
              <p style={{ fontSize: 11, color: "#9BAABB", margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Process Safety Event — Official Report
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#334155", margin: "0 0 4px 0" }}>
                {report.user.site}
              </p>
              <p style={{ fontSize: 10, color: "#9BAABB", margin: 0, fontFamily: "monospace" }}>
                {formatDateFull(report.createdAt)}
              </p>
            </div>
          </div>

          {/* Classification banner */}
          <div style={{
            border: `2px solid ${cfg.borderColor}`,
            borderRadius: 4,
            padding: "16px 20px",
            marginBottom: 24,
            background: `${cfg.borderColor}10`,
          }}>
            <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", color: cfg.borderColor, margin: "0 0 6px 0" }}>
              Final Classification
            </p>
            <p style={{ fontSize: 36, fontWeight: 900, margin: "0 0 4px 0", letterSpacing: "-0.01em", color: "#0F1923" }}>
              {cfg.title} — {cfg.badge}
            </p>
            <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>{cfg.subtitle}</p>
          </div>

          {/* Meta grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
            {[
              { label: "Analyst",           value: report.user.name },
              { label: "Role",              value: report.user.role },
              { label: "Analysis Duration", value: formatDuration(report.session.durationSeconds) },
              { label: "Questions Answered", value: `${report.verdict.answeredQuestions} / ${report.verdict.totalQuestions}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 3, padding: "10px 12px" }}>
                <p style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#9BAABB", margin: "0 0 4px 0" }}>{label}</p>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#0F1923", margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#9BAABB", marginBottom: 12 }}>
              Session Timeline
            </p>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 3, padding: "10px 12px" }}>
                <p style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9BAABB", margin: "0 0 4px 0" }}>Started</p>
                <p style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#334155", margin: 0 }}>
                  {formatDateFull(report.session.startedAt)}
                </p>
              </div>
              <div style={{ flex: 1, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 3, padding: "10px 12px" }}>
                <p style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9BAABB", margin: "0 0 4px 0" }}>Completed</p>
                <p style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#334155", margin: 0 }}>
                  {formatDateFull(report.session.completedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Questionnaire detail */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#9BAABB", marginBottom: 12 }}>
              Questionnaire Detail
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["#", "Step", "Question", "Answer"].map((h) => (
                    <th key={h} style={{
                      padding: "8px 10px", textAlign: "left", fontSize: 8,
                      fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em",
                      color: "#9BAABB", borderBottom: "1px solid #E2E8F0",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.answers.map((a, i) => (
                  <tr key={a.questionId} style={{ background: i % 2 === 0 ? "white" : "#F8FAFC" }}>
                    <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: "#9BAABB", borderBottom: "1px solid #F0F4F8", whiteSpace: "nowrap" }}>
                      #{a.validation}
                    </td>
                    <td style={{ padding: "8px 10px", fontSize: 10, color: "#9BAABB", borderBottom: "1px solid #F0F4F8", whiteSpace: "nowrap" }}>
                      {a.stepLabel.split("·")[0]?.trim()}
                    </td>
                    <td style={{ padding: "8px 10px", color: "#334155", borderBottom: "1px solid #F0F4F8", lineHeight: 1.4 }}>
                      {a.questionTitle}
                    </td>
                    <td style={{ padding: "8px 10px", borderBottom: "1px solid #F0F4F8", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontWeight: 900, fontSize: 10, textTransform: "uppercase",
                        letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 3,
                        background: a.answer === "YES" ? "#E8321A18" : "#3B6FD418",
                        color: a.answer === "YES" ? "#E8321A" : "#3B6FD4",
                      }}>
                        {a.answer}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 36, paddingTop: 16,
            borderTop: "1px solid #E2E8F0",
            display: "flex", justifyContent: "space-between",
            fontSize: 9, color: "#9BAABB",
          }}>
            <span>Generated by PSEVO Engine · {report.user.site}</span>
            <span>PSE-RPT-{report.id.slice(0, 8).toUpperCase()} · Confidential</span>
            <span>{formatDateFull(report.createdAt)}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultScreen;