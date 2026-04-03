// ─────────────────────────────────────────────────────────────────────────────
// hooks/useClassifier.ts
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { QUESTIONS } from "../data/Questions";
import type { Result } from "../data/Questions";
import type { Report, ReportAnswer, SessionDraft } from "../types/Report";
import {
  generateUUID,
  saveReport,
  saveDraft,
  loadDraft,
  clearDraft,
} from "../services/storage";

const RESULT_LABELS: Record<Result, string> = {
  TIER_1:          "PSE Tier 1",
  TIER_2:          "PSE Tier 2",
  NOT_PSE:         "Not a PSE Incident",
  CHECK_THRESHOLD: "Threshold Verification Required",
};

const CURRENT_USER = {
  name: "A. Zeghad",
  role: "Lead Engineer",
  site: "26.0 Version",
};

export interface ClassifierState {
  sessionId: string;
  activeIndex: number;
  answers: Record<number, string>;
  result: Result | null;
  report: Report | null;
  startedAt: string;
}

export function useClassifier() {
  const [state, setState] = useState<ClassifierState>(() => {
    const draft = loadDraft();
    if (draft) {
      return {
        sessionId:   draft.id,
        activeIndex: draft.activeIndex,
        answers:     draft.answers,
        result:      null,
        report:      null,
        startedAt:   draft.startedAt,
      };
    }
    return {
      sessionId:   generateUUID(),
      activeIndex: 0,
      answers:     {},
      result:      null,
      report:      null,
      startedAt:   new Date().toISOString(),
    };
  });

  const hasDraftRef = useRef(!!loadDraft());

  // Persist draft on every answer change
  useEffect(() => {
    if (state.result) return;
    const draft: SessionDraft = {
      id:          state.sessionId,
      startedAt:   state.startedAt,
      activeIndex: state.activeIndex,
      answers:     state.answers,
    };
    saveDraft(draft);
  }, [state.answers, state.activeIndex, state.result]);

  // ── Build final report ──────────────────────────────────────────────────

  const buildReport = useCallback(
    (answers: Record<number, string>, result: Result): Report => {
      const now = new Date().toISOString();
      const durationSeconds = Math.round(
        (new Date(now).getTime() - new Date(state.startedAt).getTime()) / 1000
      );

      const reportAnswers: ReportAnswer[] = QUESTIONS.filter(
        (q) => q.id in answers
      ).map((q) => ({
        questionId:    q.id,
        validation:    q.validation,
        stepLabel:     q.stepLabel,
        questionTitle: q.title,
        answer:        answers[q.id],
      }));

      return {
        id:        state.sessionId,
        createdAt: now,
        updatedAt: now,
        user:      CURRENT_USER,
        session: {
          startedAt:       state.startedAt,
          completedAt:     now,
          durationSeconds,
        },
        answers: reportAnswers,
        verdict: {
          result,
          label:             RESULT_LABELS[result],
          totalQuestions:    QUESTIONS.length,
          answeredQuestions: reportAnswers.length,
        },
      };
    },
    [state.sessionId, state.startedAt]
  );

  // ── Handle answer ───────────────────────────────────────────────────────

  const handleAnswer = useCallback(
    (nextId: number | string, label: string) => {
      const qId = QUESTIONS[state.activeIndex].id;
      const newAnswers = { ...state.answers, [qId]: label };

      if (typeof nextId === "string") {
        const result = nextId as Result;
        const report = buildReport(newAnswers, result);
        saveReport(report);
        clearDraft();
        setState((prev) => ({ ...prev, answers: newAnswers, result, report }));
        return;
      }

      const nextIndex = QUESTIONS.findIndex((q) => q.id === nextId);
      if (nextIndex === -1) return;
      setState((prev) => ({ ...prev, answers: newAnswers, activeIndex: nextIndex }));
    },
    [state.activeIndex, state.answers, buildReport]
  );

  // ── Reset ───────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    clearDraft();
    hasDraftRef.current = false;
    setState({
      sessionId:   generateUUID(),
      activeIndex: 0,
      answers:     {},
      result:      null,
      report:      null,
      startedAt:   new Date().toISOString(),
    });
  }, []);

  return {
    ...state,
    handleAnswer,
    reset,
    hasDraft:     hasDraftRef.current,
    answeredCount: Object.keys(state.answers).length,
  };
}