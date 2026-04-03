// ─────────────────────────────────────────────────────────────────────────────
// components/HistoryView.tsx — Tableau de bord historique des incidents
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Filter,
  Clock,
  Shield,
  AlertTriangle,
  XCircle,
  Search as SearchIcon,
} from "lucide-react";
import type { Report } from "../types/Report";
import type { Result } from "../data/Questions";
import { getReports, deleteReport, exportReportAsJSON } from "../services/storage";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RESULT_CONFIG: Record<
  Result,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  TIER_1: {
    label: "PSE Tier 1",
    color: "text-[#E8321A]",
    bg:    "bg-[#E8321A]/10",
    icon:  <Shield size={12} />,
  },
  TIER_2: {
    label: "PSE Tier 2",
    color: "text-[#F59E0B]",
    bg:    "bg-[#F59E0B]/10",
    icon:  <AlertTriangle size={12} />,
  },
  NOT_PSE: {
    label: "Non PSE",
    color: "text-[#9BAABB]",
    bg:    "bg-[#9BAABB]/10",
    icon:  <XCircle size={12} />,
  },
  CHECK_THRESHOLD: {
    label: "Seuils à vérifier",
    color: "text-[#3B6FD4]",
    bg:    "bg-[#3B6FD4]/10",
    icon:  <SearchIcon size={12} />,
  },
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}min ${s}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const ReportDetailModal: React.FC<{
  report: Report;
  onClose: () => void;
  onExportJSON: (r: Report) => void;
}> = ({ report, onClose, onExportJSON }) => {
  const cfg = RESULT_CONFIG[report.verdict.result];

  // Print: masquer tout sauf #print-report
  const handlePrint = () => window.print();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F1923]/40 backdrop-blur-sm z-40 print:hidden"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        id="print-report"
        className="fixed inset-x-4 top-6 bottom-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[720px] z-50 flex flex-col bg-white border border-[#E2E8F0] rounded-sm shadow-2xl overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#E8321A] flex items-center justify-center rounded-sm">
              <FileText size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#0F1923]">
                Rapport d'incident
              </p>
              <p className="text-[9px] font-mono text-[#9BAABB]">{report.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExportJSON(report)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] border border-[#E2E8F0] text-[#9BAABB] hover:text-[#3B6FD4] hover:border-[#3B6FD4] rounded-sm transition-colors"
            >
              <Download size={11} /> JSON
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] bg-[#0F1923] text-white hover:bg-[#E8321A] rounded-sm transition-colors"
            >
              <FileText size={11} /> Imprimer
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-[#9BAABB] hover:text-[#0F1923] border border-[#E2E8F0] rounded-sm"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: "thin" }}>

          {/* Print header (visible uniquement à l'impression) */}
          <div className="hidden print:flex items-center justify-between mb-6 pb-4 border-b-2 border-[#0F1923]">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Rapport PSE Officiel</h1>
              <p className="text-xs text-gray-500 font-mono mt-1">{report.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-700">PSEVO · {report.user.site}</p>
              <p className="text-xs text-gray-500">{formatDate(report.createdAt)}</p>
            </div>
          </div>

          {/* Verdict banner */}
          <div
            className={`flex items-center gap-4 p-4 rounded-sm border ${cfg.bg}`}
            style={{ borderColor: "rgba(0,0,0,0.06)" }}
          >
            <div className={`text-2xl font-black ${cfg.color}`} style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {cfg.label.toUpperCase()}
            </div>
            <div className="ml-auto text-right">
              <p className="text-[9px] font-bold text-[#9BAABB] uppercase tracking-[0.15em]">Durée d'analyse</p>
              <p className="text-[13px] font-black text-[#0F1923]">
                {formatDuration(report.session.durationSeconds)}
              </p>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Date de création",  value: formatDate(report.createdAt) },
              { label: "Analyste",          value: `${report.user.name} · ${report.user.role}` },
              { label: "Site opérationnel", value: report.user.site },
              { label: "Questions répondues", value: `${report.verdict.answeredQuestions} / ${report.verdict.totalQuestions}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-sm">
                <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#9BAABB] mb-1">{label}</p>
                <p className="text-[12px] font-black text-[#0F1923]">{value}</p>
              </div>
            ))}
          </div>

          {/* Answers */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9BAABB] mb-3">
              Détail du questionnaire
            </p>
            <div className="space-y-2">
              {report.answers.map((a) => (
                <div
                  key={a.questionId}
                  className="flex items-start gap-3 p-3 bg-white border border-[#E2E8F0] rounded-sm"
                >
                  <span className="text-[8px] font-black font-mono text-[#9BAABB] mt-0.5 flex-shrink-0 w-6">
                    #{a.validation}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#9BAABB] mb-0.5">{a.stepLabel}</p>
                    <p className="text-[12px] font-bold text-[#0F1923] leading-snug">{a.questionTitle}</p>
                  </div>
                  <span
                    className={[
                      "text-[9px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-sm flex-shrink-0",
                      a.answer === "OUI"
                        ? "bg-[#E8321A]/10 text-[#E8321A]"
                        : "bg-[#3B6FD4]/10 text-[#3B6FD4]",
                    ].join(" ")}
                  >
                    {a.answer}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Print footer */}
          <div className="hidden print:block pt-6 border-t border-gray-300 text-center text-xs text-gray-400">
            Document généré par PSEVO Engine — {formatDate(report.createdAt)} — Confidentiel
          </div>
        </div>
      </div>
    </>
  );
};

// ─── HistoryView ──────────────────────────────────────────────────────────────

type SortField  = "date" | "result";
type SortDir    = "asc" | "desc";
type FilterResult = "ALL" | Result;

const HistoryView: React.FC = () => {
  const [reports, setReports]       = useState<Report[]>([]);
  const [filter, setFilter]         = useState<FilterResult>("ALL");
  const [sortField, setSortField]   = useState<SortField>("date");
  const [sortDir, setSortDir]       = useState<SortDir>("desc");
  const [selected, setSelected]     = useState<Report | null>(null);
  const [search, setSearch]         = useState("");

  const reload = useCallback(() => setReports(getReports()), []);

  useEffect(() => { reload(); }, [reload]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer ce rapport ? Cette action est irréversible.")) return;
    deleteReport(id);
    reload();
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const filtered = reports
    .filter((r) => filter === "ALL" || r.verdict.result === filter)
    .filter((r) =>
      search === "" ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.user.name.toLowerCase().includes(search.toLowerCase()) ||
      r.user.site.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        cmp = a.verdict.result.localeCompare(b.verdict.result);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />
    ) : (
      <ChevronDown size={11} className="opacity-20" />
    );

  return (
    <>
      <div
        className="flex flex-col h-full bg-[#F0F4F8]"
        style={{ fontFamily: "'Barlow', sans-serif" }}
      >
        {/* Header */}
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-5">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#E8321A] mb-1">
            PSEVO Engine · Base locale
          </p>
          <h1
            className="text-[26px] font-black uppercase leading-none tracking-tight text-[#0F1923]"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Historique des incidents
          </h1>
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-3 flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <SearchIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9BAABB]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm pl-8 pr-3 py-1.5 text-[10px] font-mono text-[#334155] placeholder:text-[#CBD5E1] outline-none focus:border-[#3B6FD4] w-44 transition-colors"
            />
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9BAABB] flex items-center gap-1">
              <Filter size={10} /> Filtrer :
            </span>
            {(["ALL", "TIER_1", "TIER_2", "NOT_PSE", "CHECK_THRESHOLD"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  "px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-[0.1em] transition-all",
                  filter === f
                    ? f === "ALL"
                      ? "bg-[#0F1923] text-white"
                      : `${RESULT_CONFIG[f as Result]?.bg} ${RESULT_CONFIG[f as Result]?.color}`
                    : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#9BAABB] hover:border-[#CBD5E1]",
                ].join(" ")}
              >
                {f === "ALL" ? "Tous" : RESULT_CONFIG[f as Result]?.label}
              </button>
            ))}
          </div>

          <div className="ml-auto text-[9px] font-bold text-[#9BAABB]">
            {filtered.length} rapport{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-8 py-6" style={{ scrollbarWidth: "thin" }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm flex items-center justify-center mb-4">
                <FileText size={20} className="text-[#CBD5E1]" />
              </div>
              <p className="text-[12px] font-bold text-[#9BAABB]">Aucun rapport trouvé</p>
              <p className="text-[10px] text-[#CBD5E1] mt-1">
                {reports.length === 0
                  ? "Complétez une analyse pour voir les rapports ici."
                  : "Modifiez les filtres pour afficher des résultats."}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-sm overflow-hidden shadow-sm">
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-0 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {[
                  { label: "ID / Analyste",       field: null },
                  { label: "Date",                 field: "date" as SortField },
                  { label: "Criticité",            field: "result" as SortField },
                  { label: "Durée · Questions",    field: null },
                  { label: "",                     field: null },
                ].map(({ label, field }, i) => (
                  <div
                    key={i}
                    onClick={() => field && toggleSort(field)}
                    className={[
                      "px-4 py-2.5 text-[8px] font-black uppercase tracking-[0.18em] text-[#9BAABB] flex items-center gap-1",
                      field ? "cursor-pointer hover:text-[#0F1923] transition-colors select-none" : "",
                    ].join(" ")}
                  >
                    {label}
                    {field && <SortIcon field={field} />}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {filtered.map((report) => {
                const cfg = RESULT_CONFIG[report.verdict.result];
                return (
                  <div
                    key={report.id}
                    onClick={() => setSelected(report)}
                    className={[
                      "grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-0 cursor-pointer transition-colors",
                      "hover:bg-[#F8FAFC] border-b border-[#F0F4F8] last:border-0",
                    ].join(" ")}
                  >
                    {/* ID / User */}
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-black text-[#0F1923]">{report.user.name}</p>
                      <p className="text-[8px] font-mono text-[#CBD5E1] mt-0.5">
                        {report.id.slice(0, 18)}…
                      </p>
                    </div>

                    {/* Date */}
                    <div className="px-4 py-3 flex items-center">
                      <div>
                        <p className="text-[10px] font-bold text-[#334155]">
                          {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                        <p className="text-[8px] font-mono text-[#9BAABB]">
                          {new Date(report.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>

                    {/* Result badge */}
                    <div className="px-4 py-3 flex items-center">
                      <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-sm ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="px-4 py-3 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[9px] text-[#9BAABB]">
                        <Clock size={10} />
                        {formatDuration(report.session.durationSeconds)}
                      </span>
                      <span className="text-[9px] text-[#9BAABB]">
                        {report.verdict.answeredQuestions}Q
                      </span>
                    </div>

                    {/* Actions */}
                    <div
                      className="px-3 py-3 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => exportReportAsJSON(report)}
                        className="w-7 h-7 flex items-center justify-center text-[#9BAABB] hover:text-[#3B6FD4] border border-transparent hover:border-[#3B6FD4]/30 rounded-sm transition-colors"
                        title="Exporter JSON"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(report.id, e)}
                        className="w-7 h-7 flex items-center justify-center text-[#9BAABB] hover:text-[#E8321A] border border-transparent hover:border-[#E8321A]/30 rounded-sm transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Report detail modal */}
      {selected && (
        <ReportDetailModal
          report={selected}
          onClose={() => setSelected(null)}
          onExportJSON={exportReportAsJSON}
        />
      )}
    </>
  );
};

export default HistoryView;