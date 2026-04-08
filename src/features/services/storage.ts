// ─────────────────────────────────────────────────────────────────────────────
// services/storage.ts — LocalStorage service
// ─────────────────────────────────────────────────────────────────────────────

import type { Report, SessionDraft } from "../types/Report";

const REPORTS_KEY  = "psevo_reports";
const DRAFT_KEY    = "psevo_session_draft";

// ── UUID v4 (sans dépendance externe) ────────────────────────────────────────

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Reports ──────────────────────────────────────────────────────────────────

export function getReports(): Report[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Report[];
  } catch {
    return [];
  }
}

export function saveReport(report: Report): void {
  try {
    const existing = getReports();
    // Déduplique par ID (au cas où on re-sauvegarde)
    const updated = [report, ...existing.filter((r) => r.id !== report.id)];
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("psevo:storage — saveReport failed", e);
  }
}

export function deleteReport(id: string): void {
  try {
    const updated = getReports().filter((r) => r.id !== id);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("psevo:storage — deleteReport failed", e);
  }
}

export function getReportById(id: string): Report | null {
  return getReports().find((r) => r.id === id) ?? null;
}

// ── Session Draft (reprise de session) ───────────────────────────────────────

export function saveDraft(draft: SessionDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.error("psevo:storage — saveDraft failed", e);
  }
}

export function loadDraft(): SessionDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionDraft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

// ── Export JSON ───────────────────────────────────────────────────────────────

export function exportReportAsJSON(report: Report): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = `psevo_report_${report.id.slice(0, 8)}_${report.createdAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}