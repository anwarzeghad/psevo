

export interface Chemical {
  name: string;
  cas: string;
  tq1: number;
  tq2: number;
  hazard: number; // 1: Toxic, 2: Flammable Toxic, 3: Flammable, 4: Other
}

export interface StandardSection {
  id: string;
  title: string;
  content: string;
}

export interface DocumentRef {
  id: string;
  title: string;
  rev: string;
  date: string;
  category: 'Procedure' | 'Standard' | 'Regulation';
}

export type TabType = 'api' | 'chemicals' | 'calc' | 'docs';