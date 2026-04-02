// ─────────────────────────────────────────────────────────────────────────────
// PSE Incident Classification — Full Decision Tree
// Based on TIER 1 / TIER 2 / TIER 3 logic
// ─────────────────────────────────────────────────────────────────────────────

export type Result =
  | "NOT_PSE"        // Not a PSE incident
  | "TIER_1"         // PSE Tier 1
  | "TIER_2"         // PSE Tier 2
  | "CHECK_THRESHOLD"; // → Threshold verification (table)

export type Step =
  | "STEP_1"   // Initial validation
  | "STEP_2A"  // Human consequences
  | "STEP_2B"  // Evacuations & damage
  | "STEP_3"   // Safety releases (PRD/Upset)
  | "STEP_4"   // Environmental consequences
  | "FINAL";

export interface Option {
  label: string;
  sublabel?: string;         // optional description under label
  nextId: number | Result;
}

export interface Question {
  id: number;
  step: Step;
  stepLabel: string;         // e.g., "Step 1 · Initial validation"
  validation: string;        // sequence number displayed "01", "02"...
  title: string;
  description?: string;      // context or clarification
  options: Option[];
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const QUESTIONS: Question[] = [

  // ── STEP 1: Initial validation ─────────────────────────────────────────────

  {
    id: 1,
    step: "STEP_1",
    stepLabel: "Step 1 · Initial validation",
    validation: "01",
    title: "Did the incident occur during the process?",
    description: "A process incident involves a loss of containment of a hazardous substance during an industrial activity.",
    options: [
      { label: "YES", nextId: 2 },
      { label: "NO", sublabel: "Not a PSE incident", nextId: "NOT_PSE" },
    ],
  },

  {
    id: 2,
    step: "STEP_1",
    stepLabel: "Step 1 · Initial validation",
    validation: "02",
    title: "Was the release unplanned and uncontrolled?",
    description: "A voluntary and planned release (e.g., scheduled maintenance purge) is not a PSE incident.",
    options: [
      { label: "YES", nextId: 3 },
      { label: "NO", sublabel: "Not a PSE incident", nextId: "NOT_PSE" },
    ],
  },

  // ── STEP 2A: Human consequences — Injuries & fatalities ────────────────────

  {
    id: 3,
    step: "STEP_2A",
    stepLabel: "Step 2A · Human consequences",
    validation: "03",
    title: "Were there any injuries due to this release?",
    description: "Includes any employee, contractor, or third party who suffered physical harm directly related to the release.",
    options: [
      { label: "YES", nextId: 4 },
      { label: "NO", sublabel: "Proceed to property damage", nextId: 7 },
    ],
  },

  {
    id: 4,
    step: "STEP_2A",
    stepLabel: "Step 2A · Human consequences",
    validation: "04",
    title: "Did the release result in a fatality or lost work time?",
    description: "For an employee or contractor: death or any work stoppage due to the release.",
    options: [
      { label: "YES", sublabel: "PSE TIER 1 confirmed", nextId: "TIER_1" },
      { label: "NO", nextId: 5 },
    ],
  },

  {
    id: 5,
    step: "STEP_2A",
    stepLabel: "Step 2A · Human consequences",
    validation: "05",
    title: "Was there hospitalization or a fatality of a third party?",
    description: "A third party is anyone outside the company (neighbor, passerby, etc.).",
    options: [
      { label: "YES", sublabel: "PSE TIER 1 confirmed", nextId: "TIER_1" },
      { label: "NO", nextId: 6 },
    ],
  },

  {
    id: 6,
    step: "STEP_2A",
    stepLabel: "Step 2A · Human consequences",
    validation: "06",
    title: "Was there a recordable injury for an employee or contractor?",
    description: "A 'recordable' injury requires medical treatment beyond first aid, or results in work restrictions.",
    options: [
      { label: "YES", sublabel: "PSE TIER 2 confirmed", nextId: "TIER_2" },
      { label: "NO", sublabel: "Proceed to property damage", nextId: 7 },
    ],
  },

  // ── STEP 2B: Evacuations & financial damage ───────────────────────────────

  {
    id: 7,
    step: "STEP_2B",
    stepLabel: "Step 2B · Evacuations & damage",
    validation: "07",
    title: "Was there an official community evacuation or shelter-in-place?",
    description: "Any public protection measure ordered by authorities or the company for populations outside the site.",
    options: [
      { label: "YES", sublabel: "PSE TIER 1 confirmed", nextId: "TIER_1" },
      { label: "NO", nextId: 8 },
    ],
  },

  {
    id: 8,
    step: "STEP_2B",
    stepLabel: "Step 2B · Evacuations & damage",
    validation: "08",
    title: "Did the incident cause a fire or explosion with direct costs ≥ $100,000?",
    description: "Direct cost to the company: repairs, equipment replacement, immediate cleanup.",
    options: [
      { label: "YES", sublabel: "PSE TIER 1 confirmed", nextId: "TIER_1" },
      { label: "NO", nextId: 9 },
    ],
  },

  {
    id: 9,
    step: "STEP_2B",
    stepLabel: "Step 2B · Evacuations & damage",
    validation: "09",
    title: "Did the fire or explosion cause direct costs between $2,500 and $100,000?",
    description: "If no fire or explosion occurred, answer NO.",
    options: [
      { label: "YES", sublabel: "PSE TIER 2 confirmed", nextId: "TIER_2" },
      { label: "NO", sublabel: "Proceed to release assessment", nextId: 10 },
    ],
  },

  // ── STEP 3: Safety releases (PRD / Upset) ────────────────────────────────

  {
    id: 10,
    step: "STEP_3",
    stepLabel: "Step 3 · Safety releases",
    validation: "10",
    title: "Is this a release via a technical safety device?",
    description: "Devices include: pressure relief valve (PRD), safety instrumented system (SIS), manual emergency depressurization.",
    options: [
      { label: "YES", sublabel: "Assess environmental consequences", nextId: 12 },
      { label: "NO", nextId: 11 },
    ],
  },

  {
    id: 11,
    step: "STEP_3",
    stepLabel: "Step 3 · Safety releases",
    validation: "11",
    title: "Is this an abnormal (upset) emission from an authorized or regulated source?",
    description: "Examples: upset flare, abnormal overpressure vent from storage.",
    options: [
      { label: "YES", sublabel: "Assess environmental consequences", nextId: 12 },
      { label: "NO", sublabel: "Check quantity thresholds", nextId: "CHECK_THRESHOLD" },
    ],
  },

  // ── STEP 4: Environmental & public consequences ─────────────────────────

  {
    id: 12,
    step: "STEP_4",
    stepLabel: "Step 4 · Environmental consequences",
    validation: "12",
    title: "Did the release cause liquid fallout (rainout)?",
    description: "Condensation or deposition of liquid from the release cloud onto ground areas.",
    options: [
      { label: "YES", sublabel: "Threshold verification required", nextId: "CHECK_THRESHOLD" },
      { label: "NO", nextId: 13 },
    ],
  },

  {
    id: 13,
    step: "STEP_4",
    stepLabel: "Step 4 · Environmental consequences",
    validation: "13",
    title: "Was there a discharge to a potentially hazardous location?",
    description: "E.g.: release into a sewer, waterway, populated area, or any place that could cause secondary hazards.",
    options: [
      { label: "YES", sublabel: "Threshold verification required", nextId: "CHECK_THRESHOLD" },
      { label: "NO", nextId: 14 },
    ],
  },

  {
    id: 14,
    step: "STEP_4",
    stepLabel: "Step 4 · Environmental consequences",
    validation: "14",
    title: "Was there on-site shelter-in-place or evacuation (beyond precautionary measures)?",
    description: "Actual measures triggered by the threat of release, not applied as standard precaution.",
    options: [
      { label: "YES", sublabel: "Threshold verification required", nextId: "CHECK_THRESHOLD" },
      { label: "NO", nextId: 15 },
    ],
  },

  {
    id: 15,
    step: "STEP_4",
    stepLabel: "Step 4 · Environmental consequences",
    validation: "15",
    title: "Were public protection measures activated?",
    description: "E.g.: road closures, neighbor alerts, local authority intervention — including precautionary measures.",
    options: [
      { label: "YES", sublabel: "Threshold verification required", nextId: "CHECK_THRESHOLD" },
      { label: "NO", sublabel: "Not a PSE TIER 1 or TIER 2 incident", nextId: "NOT_PSE" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STEPS META — for sidebar
// ─────────────────────────────────────────────────────────────────────────────

export interface StepMeta {
  key: Step | "FINAL";
  label: string;
  questionIds: number[];
}

export const STEPS_META: StepMeta[] = [
  { key: "STEP_1",  label: "Step 1 · Initial validation",              questionIds: [1, 2] },
  { key: "STEP_2A", label: "Step 2A · Human consequences",             questionIds: [3, 4, 5, 6] },
  { key: "STEP_2B", label: "Step 2B · Evacuations & damage",           questionIds: [7, 8, 9] },
  { key: "STEP_3",  label: "Step 3 · Safety releases",                 questionIds: [10, 11] },
  { key: "STEP_4",  label: "Step 4 · Environmental consequences",      questionIds: [12, 13, 14, 15] },
  { key: "FINAL",   label: "Final classification",                     questionIds: [] },
];