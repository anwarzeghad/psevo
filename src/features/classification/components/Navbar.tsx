import React, { useState } from "react";
import { Bell, Search, Settings, ChevronDown } from "lucide-react";
import logo from "../../../assets/logo/logo.png";

// ─── Types ────────────────────────────────────────────────────────────────────

export type View = "dashboard" | "incidents" | "classifier" | "history" | "standards";

type NavLinkProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

type IconButtonProps = {
  children: React.ReactNode;
  label: string;
  hasBadge?: boolean;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const NavLink = ({ label, active = false, onClick }: NavLinkProps) => (
  <a
    href="#"
    onClick={(e) => { e.preventDefault(); onClick?.(); }}
    aria-current={active ? "page" : undefined}
    className={[
      "relative px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em]",
      "rounded-sm transition-all duration-150 focus:outline-none cursor-pointer",
      active
        ? "text-[#0F1923] after:absolute after:content-[''] after:bottom-[-18px] after:left-3 after:right-3 after:h-[2px] after:bg-[#E8321A] after:rounded-full"
        : "text-[#9BAABB] hover:text-[#0F1923] hover:bg-[#F8FAFC]",
    ].join(" ")}
  >
    {label}
  </a>
);

const IconButton = ({ children, label, hasBadge = false }: IconButtonProps) => (
  <button
    aria-label={label}
    className="relative w-[34px] h-[34px] flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm text-[#9BAABB] hover:border-[#3B6FD4] hover:text-[#3B6FD4] hover:bg-white transition-all duration-150"
  >
    {children}
    {hasBadge && (
      <span className="absolute top-[5px] right-[5px] w-[7px] h-[7px] bg-[#E8321A] rounded-full border-[1.5px] border-white" />
    )}
  </button>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────

interface NavbarProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const Navbar = ({ activeView, onNavigate }: NavbarProps) => {
  const [searchFocused, setSearchFocused] = useState(false);

  const NAV_ITEMS: { key: View; label: string }[] = [
    { key: "dashboard",  label: "Dashboard"  },
    { key: "incidents",  label: "Incidents"  },
    { key: "classifier", label: "Classifier" },
    { key: "history",    label: "History"    },
    { key: "standards",  label: "Standards"  },
  ];

  return (
    <nav
      className="h-14 sticky top-0 z-50 flex items-center gap-0 px-6 bg-white border-b border-[#E2E8F0] shadow-[0_1px_8px_rgba(15,25,35,0.06)] print:hidden"
      style={{ fontFamily: "'Barlow', sans-serif" }}
    >
      {/* LOGO */}
      <div className="flex items-center gap-2.5 cursor-pointer mr-6 flex-shrink-0 group">
        <img src={logo} alt="Psevo logo" className="h-8" />
      </div>

      {/* DIVIDER */}
      <div className="w-px h-7 bg-[#E2E8F0] mx-5 flex-shrink-0" />

      {/* SITE BADGE */}
      <div className="hidden sm:flex items-center gap-2 px-2.5 py-[5px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm flex-shrink-0 mr-7">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse flex-shrink-0" />
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#9BAABB] leading-none mb-0.5">
            Operational Site
          </p>
          <p
            className="text-[13px] font-black uppercase tracking-[0.08em] text-[#0F1923] leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            26.0 Version
          </p>
        </div>
      </div>

      {/* NAV LINKS */}
      <div className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map(({ key, label }) => (
          <NavLink
            key={key}
            label={label}
            active={activeView === key}
            onClick={() => onNavigate(key)}
          />
        ))}
      </div>

      {/* RIGHT */}
      <div className="ml-auto flex items-center gap-2">

        {/* Search */}
        <div className="relative hidden xl:block">
          <Search
            size={13}
            className={[
              "absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
              searchFocused ? "text-[#3B6FD4]" : "text-[#9BAABB]",
            ].join(" ")}
          />
          <input
            type="text"
            placeholder="Query ID…"
            aria-label="Search query"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={[
              "bg-[#F8FAFC] border rounded-sm py-[6px] pl-8 pr-3",
              "font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[#334155]",
              "outline-none transition-all duration-200 placeholder:text-[#CBD5E1]",
              searchFocused ? "border-[#3B6FD4] w-48" : "border-[#E2E8F0] w-36",
            ].join(" ")}
          />
        </div>

        <IconButton label="Notifications" hasBadge>
          <Bell size={15} />
        </IconButton>

        <IconButton label="Settings">
          <Settings size={15} />
        </IconButton>

        <div className="w-px h-7 bg-[#E2E8F0] mx-1 flex-shrink-0" />

        {/* Profile */}
        <div className="flex items-center gap-2.5 pl-2 pr-2.5 py-[5px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm cursor-pointer hover:bg-white hover:border-[#CBD5E1] transition-all duration-150">
          <div
            className="w-7 h-7 bg-[#0F1923] rounded-sm flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}
          >
            AZ
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] font-black uppercase tracking-[0.05em] text-[#0F1923] leading-none mb-[3px]">
              A. Zeghad
            </p>
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#E8321A] leading-none">
              Lead Engineer
            </p>
          </div>
          <ChevronDown size={13} className="text-[#CBD5E1] hidden sm:block" />
        </div>

      </div>
    </nav>
  );
};

export default Navbar;