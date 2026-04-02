import React, { useState } from "react";
import { Bell, Search, Settings, ChevronDown } from "lucide-react";
import IncidentClassifier from './features/classification/components/IncidentClassifier';
import Navbar from './features/classification/components/Navbar';

function App() {
  return (
    <main>
      <Navbar />
      <IncidentClassifier />
      
    </main>
  );
}

export default App;