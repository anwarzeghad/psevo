// ─────────────────────────────────────────────────────────────────────────────
// components/DashboardView.tsx — Safety Control Tower
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Shield, TrendingDown, Activity, Wind } from "lucide-react";
import { getReports } from "../../services/storage";
import type { Report } from "../../types/Report";

// ─── Data helpers ─────────────────────────────────────────────────────────────

function useDashboardData() {
  const reports: Report[] = getReports();

  const tier1 = reports.filter(r => r.verdict.result === "TIER_1").length;
  const tier2 = reports.filter(r => r.verdict.result === "TIER_2").length;
  const nearMiss = reports.filter(r => r.verdict.result === "NOT_PSE").length;

  // Days since last LOPC (last Tier1 or Tier2)
  const lastLopc = reports
    .filter(r => r.verdict.result === "TIER_1" || r.verdict.result === "TIER_2")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const daysSinceLopc = lastLopc
    ? Math.floor((Date.now() - new Date(lastLopc.createdAt).getTime()) / 86_400_000)
    : 128; // demo value

  // Trend line: incidents per month over last 12 months
  const monthlyTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const label = d.toLocaleString("en-GB", { month: "short", year: "2-digit" });
      const count = reports.filter(r => {
        const rd = new Date(r.createdAt);
        return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
      }).length;
      // Inject demo data if empty
      return { label, count: count || Math.floor(Math.random() * 4) };
    });
  }, []);

  // Root cause distribution (demo data — replace with real field when available)
  const rootCauses = [
    { name: "Corrosion",        value: 32, color: "#E8321A" },
    { name: "Human Error",      value: 27, color: "#F59E0B" },
    { name: "Equipment Failure",value: 24, color: "#3B6FD4" },
    { name: "Design Error",     value: 17, color: "#9BAABB" },
  ];

  // Total release mass (kg) — demo
  const totalMassKg = 2_847;

  return { tier1, tier2, nearMiss, daysSinceLopc, lastLopc, monthlyTrend, rootCauses, totalMassKg };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const KpiCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: React.ReactNode;
}> = ({ label, value, sub, accent = "#3B6FD4", icon }) => (
  <div className="bg-white border border-[#E2E8F0] rounded-sm p-5 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9BAABB]">{label}</p>
      {icon && <span style={{ color: accent }}>{icon}</span>}
    </div>
    <p className="font-black leading-none" style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: "clamp(28px, 3vw, 40px)",
      color: accent,
    }}>
      {value}
    </p>
    {sub && <p className="text-[10px] text-[#9BAABB]">{sub}</p>}
  </div>
);

// Safety pyramid (Bird's triangle) using pure CSS
const SafetyPyramid: React.FC<{ tier1: number; tier2: number; nearMiss: number }> = ({
  tier1, tier2, nearMiss,
}) => {
  const total = tier1 + tier2 + nearMiss || 1;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-sm p-5">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9BAABB] mb-4">
        Safety Pyramid (Bird's Triangle)
      </p>
      <div className="flex flex-col items-center gap-0">
        {/* Tier 1 — tip */}
        <div className="flex flex-col items-center w-full" style={{ maxWidth: 280 }}>
          <div
            className="flex items-center justify-between w-full px-4 py-2.5 text-white"
            style={{
              background: "#E8321A",
              clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
              width: `${33 + (tier1 / total) * 20}%`,
              minWidth: 120,
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-wide mx-auto">
              Tier 1 · {tier1}
            </span>
          </div>

          {/* Tier 2 */}
          <div
            className="flex items-center justify-center w-full px-4 py-2.5 text-white mt-0.5"
            style={{
              background: "#F59E0B",
              width: `${55 + (tier2 / total) * 20}%`,
              minWidth: 160,
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-wide">
              Tier 2 · {tier2}
            </span>
          </div>

          {/* Near Miss / Not PSE */}
          <div
            className="flex items-center justify-center w-full px-4 py-3 mt-0.5 text-white"
            style={{
              background: "#3B6FD4",
              width: "100%",
              maxWidth: 280,
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-wide">
              Near Miss / Not PSE · {nearMiss}
            </span>
          </div>
        </div>

        {/* Ratio labels */}
        <div className="flex justify-around w-full mt-4 text-center">
          <div>
            <p className="text-[18px] font-black text-[#E8321A]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{tier1}</p>
            <p className="text-[8px] font-bold text-[#9BAABB] uppercase tracking-wide">Tier 1</p>
          </div>
          <div className="w-px bg-[#E2E8F0]" />
          <div>
            <p className="text-[18px] font-black text-[#F59E0B]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{tier2}</p>
            <p className="text-[8px] font-bold text-[#9BAABB] uppercase tracking-wide">Tier 2</p>
          </div>
          <div className="w-px bg-[#E2E8F0]" />
          <div>
            <p className="text-[18px] font-black text-[#3B6FD4]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{nearMiss}</p>
            <p className="text-[8px] font-bold text-[#9BAABB] uppercase tracking-wide">Near Miss</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Plant heatmap — simplified grid
const PLANT_UNITS = [
  { id: "DST", label: "Distillation",   x: 1, y: 0, incidents: 4 },
  { id: "RXN", label: "Reaction",       x: 2, y: 0, incidents: 2 },
  { id: "STR", label: "Storage",        x: 0, y: 1, incidents: 1 },
  { id: "HEX", label: "Heat Exchange",  x: 1, y: 1, incidents: 3 },
  { id: "CMP", label: "Compression",    x: 2, y: 1, incidents: 5 },
  { id: "UTL", label: "Utilities",      x: 0, y: 2, incidents: 0 },
  { id: "FLR", label: "Flare",          x: 1, y: 2, incidents: 2 },
  { id: "WWT", label: "Wastewater",     x: 2, y: 2, incidents: 1 },
];

const heatColor = (n: number): string => {
  if (n === 0) return "#F8FAFC";
  if (n <= 1)  return "#DBEAFE";
  if (n <= 2)  return "#FEF3C7";
  if (n <= 3)  return "#FED7AA";
  return "#FECACA";
};
const heatText = (n: number): string => {
  if (n === 0) return "#CBD5E1";
  if (n <= 1)  return "#3B6FD4";
  if (n <= 2)  return "#D97706";
  if (n <= 3)  return "#EA580C";
  return "#E8321A";
};

const PlantHeatmap: React.FC = () => (
  <div className="bg-white border border-[#E2E8F0] rounded-sm p-5">
    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9BAABB] mb-4">
      Plant Unit Heatmap
    </p>
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
    >
      {PLANT_UNITS.map((u) => (
        <div
          key={u.id}
          className="rounded-sm p-3 flex flex-col gap-1 border"
          style={{
            background: heatColor(u.incidents),
            borderColor: u.incidents > 0 ? heatText(u.incidents) + "30" : "#E2E8F0",
          }}
        >
          <p className="text-[8px] font-black uppercase tracking-[0.15em]"
            style={{ color: heatText(u.incidents) }}>
            {u.id}
          </p>
          <p className="text-[10px] font-bold text-[#334155]">{u.label}</p>
          <p className="text-[18px] font-black leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", color: heatText(u.incidents) }}>
            {u.incidents}
          </p>
          <p className="text-[8px] text-[#9BAABB]">incident{u.incidents !== 1 ? "s" : ""}</p>
        </div>
      ))}
    </div>
    
    <div className="flex gap-3 mt-3 flex-wrap">
      {[
        { label: "None",     bg: "#F8FAFC", border: "#E2E8F0" },
        { label: "Low",      bg: "#DBEAFE", border: "#93C5FD" },
        { label: "Medium",   bg: "#FEF3C7", border: "#FDE68A" },
        { label: "High",     bg: "#FED7AA", border: "#FDBA74" },
        { label: "Critical", bg: "#FECACA", border: "#FCA5A5" },
      ].map(({ label, bg, border }) => (
        <div key={label} className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm border" style={{ background: bg, borderColor: border }} />
          <span className="text-[8px] text-[#9BAABB]">{label}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── DashboardView ────────────────────────────────────────────────────────────

const DashboardView: React.FC = () => {
  const { tier1, tier2, nearMiss, daysSinceLopc, lastLopc, monthlyTrend, rootCauses, totalMassKg } =
    useDashboardData();

  const lopcColor = daysSinceLopc < 30 ? "#E8321A" : daysSinceLopc < 90 ? "#F59E0B" : "#22C55E";

  return (
    <div
      className="flex flex-col h-full bg-[#F0F4F8] overflow-y-auto"
      style={{ fontFamily: "'Barlow', sans-serif", scrollbarWidth: "thin" }}
    >
      {/* Page header */}
      <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex-shrink-0">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#E8321A] mb-1">
          PSEVO Engine · Real-Time Overview
        </p>
        <h1 className="text-[26px] font-black uppercase leading-none tracking-tight text-[#0F1923]"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          Safety Dashboard
        </h1>
      </div>

      <div className="p-6 flex flex-col gap-5">

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4">
          <KpiCard
            label="Days Since Last LOPC"
            value={daysSinceLopc}
            sub={lastLopc ? `Last: ${new Date(lastLopc.createdAt).toLocaleDateString("en-GB")}` : "No LOPC recorded"}
            accent={lopcColor}
            icon={<Activity size={18} />}
          />
          <KpiCard
            label="Total Release Mass (YTD)"
            value={`${totalMassKg.toLocaleString()} kg`}
            sub="Cumulative atmospheric/ground release"
            accent="#3B6FD4"
            icon={<Wind size={18} />}
          />
          <KpiCard
            label="PSE Incidents (All Time)"
            value={tier1 + tier2}
            sub={`${tier1} Tier 1 · ${tier2} Tier 2`}
            accent={tier1 > 0 ? "#E8321A" : "#F59E0B"}
            icon={<Shield size={18} />}
          />
        </div>

        {/* Pyramid + Trend */}
        <div className="grid grid-cols-2 gap-4">
          <SafetyPyramid tier1={tier1} tier2={tier2} nearMiss={nearMiss} />

          {/* Trend line */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9BAABB] mb-4">
              Incident Trend (12 months)
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "#9BAABB", fontFamily: "Barlow" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#9BAABB" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "white", border: "1px solid #E2E8F0",
                    borderRadius: 4, fontSize: 11, fontFamily: "Barlow",
                  }}
                  labelStyle={{ fontWeight: 800, color: "#0F1923" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#E8321A"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#E8321A", stroke: "white", strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                  name="Incidents"
                />
              </LineChart>
            </ResponsiveContainer>
            {/* Trend indicator */}
            <div className="flex items-center gap-1.5 mt-2">
              <TrendingDown size={12} className="text-[#22C55E]" />
              <span className="text-[9px] font-bold text-[#22C55E]">Improving trend vs. prior period</span>
            </div>
          </div>
        </div>

        {/* Heatmap + Root cause */}
        <div className="grid grid-cols-2 gap-4">
          <PlantHeatmap />

          {/* Root cause pie */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9BAABB] mb-4">
              Root Cause Analysis
            </p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie
                    data={rootCauses}
                    cx="50%" cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {rootCauses.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "white", border: "1px solid #E2E8F0",
                      borderRadius: 4, fontSize: 11, fontFamily: "Barlow",
                    }}
                    formatter={(v) => [(v !== undefined ? `${v}%` : "N/A"), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2.5 flex-1">
                {rootCauses.map((c) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: c.color }} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[10px] font-bold text-[#334155]">{c.name}</span>
                        <span className="text-[10px] font-black" style={{ color: c.color }}>{c.value}%</span>
                      </div>
                      <div className="h-1 bg-[#F0F4F8] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${c.value}%`, background: c.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;