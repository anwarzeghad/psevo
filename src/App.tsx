// ─────────────────────────────────────────────────────────────────────────────
// App.tsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import Navbar from "./features/classification/components/Navbar";
import type { View } from "./features/classification/components/Navbar";
import IncidentClassifier from "./features/classification/components/IncidentClassifier";
import HistoryView from "./features/classification/components/HistoryView";
import "./index.css";

const App: React.FC = () => {
  const [view, setView] = useState<View>("classifier");

  return (
    <>
      {/* Print styles — hide everything except #print-report */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-report { display: flex !important; }
          #print-report {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: auto !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
            transform: none !important;
          }
          .print\\:block  { display: block  !important; }
          .print\\:flex   { display: flex   !important; }
          .print\\:hidden { display: none   !important; }
          @page { margin: 20mm; size: A4; }
        }
      `}</style>

      <div
        className="flex flex-col h-screen overflow-hidden"
        style={{ fontFamily: "'Barlow', sans-serif" }}
      >
        <Navbar activeView={view} onNavigate={setView} />

        <div className="flex-1 overflow-hidden">
          {view === "classifier" ? (
            <IncidentClassifier />
          ) : view === "history" ? (
            <HistoryView />
          ) : (
            // Placeholder for dashboard / standards
            <div className="flex items-center justify-center h-full text-[#CBD5E1] text-[13px] font-bold uppercase tracking-widest">
              {view.charAt(0).toUpperCase() + view.slice(1)} — Coming Soon
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default App;