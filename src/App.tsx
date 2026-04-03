// ─────────────────────────────────────────────────────────────────────────────
// App.tsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import Navbar from "./features/classification/components/Navbar";
import type { View } from "./features/classification/components/Navbar";
import IncidentClassifier from "./features/classification/components/IncidentClassifier";
import HistoryView from "./features/classification/components/HistoryView";
import DashboardView from "./features/classification/components/Dashboardview";
import StandardsView from "./features/classification/components/Standardsview";

const App: React.FC = () => {
  const [view, setView] = useState<View>("dashboard");

  return (
    <>
      {/*
        PRINT STYLES
        Strategy: hide everything, reveal only #print-zone.
        #print-zone is inside ResultScreen with full inline-styled report HTML.
      */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-zone, #print-zone * { visibility: visible !important; }
          #print-zone {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background: white !important;
          }
          @page { margin: 15mm 20mm; size: A4; }
        }
      `}</style>

      <div className="flex flex-col h-screen overflow-hidden"
        style={{ fontFamily: "'Barlow', sans-serif" }}>
        <Navbar activeView={view} onNavigate={setView} />

        <div className="flex-1 overflow-hidden">
          {view === "dashboard"  && <DashboardView />}
          {(view === "incidents" || view === "classifier") && <IncidentClassifier />}
          {view === "history"    && <HistoryView />}
          {view === "standards"  && <StandardsView />}
        </div>
      </div>
    </>
  );
};

export default App;