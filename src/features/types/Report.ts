// ─────────────────────────────────────────────────────────────────────────────
// types/Report.ts — Objet Rapport PSE
// ─────────────────────────────────────────────────────────────────────────────

import type { Result } from "../data/Questions";

export interface ReportAnswer {
  questionId: number;
  validation: string;
  stepLabel: string;
  questionTitle: string;
  answer: string;
}

export interface Report {
  id: string;               // UUID v4
  createdAt: string;        // ISO 8601
  updatedAt: string;        // dernière sauvegarde (reprise de session)
  user: {
    name: string;
    role: string;
    site: string;
  };
  session: {
    startedAt: string;      // ISO — début du questionnaire
    completedAt: string;    // ISO — fin (résultat atteint)
    durationSeconds: number;
  };
  answers: ReportAnswer[];
  verdict: {
    result: Result;
    label: string;
    totalQuestions: number;
    answeredQuestions: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Draft — session en cours (persistée pour reprise)
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionDraft {
  id: string;
  startedAt: string;
  activeIndex: number;
  answers: Record<number, string>;
}