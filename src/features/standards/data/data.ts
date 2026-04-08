
import type { Chemical, StandardSection, DocumentRef } from '../types/types';

export const INITIAL_CHEMICALS: Chemical[] = [
  { name: "Ammonia", cas: "7664-41-7", tq1: 500, tq2: 50, hazard: 1 },
  { name: "Chlorine", cas: "7782-50-5", tq1: 100, tq2: 10, hazard: 1 },
  { name: "Hydrogen Sulfide", cas: "7783-06-4", tq1: 500, tq2: 50, hazard: 1 },
  { name: "Benzene", cas: "71-43-2", tq1: 2000, tq2: 200, hazard: 2 },
  { name: "Methane", cas: "74-82-8", tq1: 5000, tq2: 500, hazard: 3 },
  { name: "Propane", cas: "74-98-6", tq1: 5000, tq2: 500, hazard: 3 },
  { name: "Ethylene", cas: "74-85-1", tq1: 5000, tq2: 500, hazard: 3 },
  { name: "Hydrofluoric Acid", cas: "7664-39-3", tq1: 100, tq2: 10, hazard: 1 },
  { name: "Phosgene", cas: "75-44-5", tq1: 10, tq2: 1, hazard: 1 }
];

export const API_754_SECTIONS: StandardSection[] = [
  {
    id: "definition",
    title: "What is a Process Safety Incident?",
    content: "An unplanned or uncontrolled release of any material from a process..."
  },
  {
    id: "indoor",
    title: "Indoor vs. Outdoor Release Rules",
    content: "Releases inside an enclosed building are classified more severely. Thresholds are divided by 2 or 4 depending on ventilation."
  }
];

export const DOCUMENTS: DocumentRef[] = [
  { id: "API-754", title: "Process Safety Indicators", rev: "Ed. 2", date: "2016", category: 'Standard' },
  { id: "PSE-PRO-01", title: "Incident Reporting Procedure", rev: "Rev. 4", date: "Jan 2024", category: 'Procedure' }
];