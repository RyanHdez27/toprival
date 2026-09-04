import React from "react";

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted"
  | "live"
  | "outline";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "bg-[#27272A] text-[#FAFAFA]",
  primary: "bg-[#D4860A]/20 text-[#F5B830] border border-[#D4860A]/30",
  success: "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/25",
  warning: "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/25",
  danger: "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25",
  info: "bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/25",
  muted: "bg-[#1F1F23] text-[#71717A]",
  live: "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 animate-pulse",
  outline: "border border-[#3F3F46] text-[#A1A1AA]",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${badgeStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const btnVariant: Record<ButtonVariant, string> = {
  primary:
    "bg-[#D4860A] hover:bg-[#BF7509] text-white shadow-[0_0_20px_#D4860A22]",
  secondary: "bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA]",
  ghost: "hover:bg-[#18181B] text-[#A1A1AA] hover:text-[#FAFAFA]",
  danger: "bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30",
  outline: "border border-[#3F3F46] hover:border-[#D4860A]/50 hover:bg-[#D4860A]/10 text-[#FAFAFA]",
};

const btnSize: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled,
  type = "button",
  fullWidth,
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${btnVariant[variant]} ${btnSize[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#111113] border border-[#27272A] rounded-xl ${onClick ? "cursor-pointer hover:border-[#3F3F46] transition-colors" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export function Avatar({
  src,
  name,
  size = 32,
  className = "",
}: {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center bg-[#27272A] text-[#F5B830] font-semibold shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

export function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  className = "",
  required,
  hint,
}: {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-[#A1A1AA]">
          {label}
          {required && <span className="text-[#D4860A] ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-[#18181B] border border-[#27272A] rounded-md px-3 py-2.5 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#D4860A] transition-colors"
      />
      {hint && <p className="text-xs text-[#71717A]">{hint}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

export function Select({
  label,
  options,
  value,
  onChange,
  className = "",
}: {
  label?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-[#A1A1AA]">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-[#18181B] border border-[#27272A] rounded-md px-3 py-2.5 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A] transition-colors appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export function Tabs({
  tabs,
  active,
  onChange,
  className = "",
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex gap-1 bg-[#111113] border border-[#27272A] rounded-lg p-1 ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
            active === tab
              ? "bg-[#D4860A] text-white"
              : "text-[#71717A] hover:text-[#A1A1AA]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon,
  trend,
  color = "primary",
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  color?: "primary" | "success" | "warning" | "info";
}) {
  const colors = {
    primary: "text-[#F5B830]",
    success: "text-[#22C55E]",
    warning: "text-[#F59E0B]",
    info: "text-[#3B82F6]",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-[#71717A] font-medium">{label}</span>
        {icon && <span className={`${colors[color]} opacity-70`}>{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
      {trend && (
        <div className="text-xs text-[#71717A] mt-1 font-mono">{trend}</div>
      )}
    </Card>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider({ className = "" }: { className?: string }) {
  return <div className={`border-t border-[#27272A] ${className}`} />;
}

// ─── Icons (inline SVG, no dep) ───────────────────────────────────────────────

export const Icon = {
  Trophy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Filter: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Swords: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/>
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  ),
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  LayoutDashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  ),
  Zap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Award: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  GameController: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/>
    </svg>
  ),
  Flag: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
    </svg>
  ),
  Upload: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  ),
  Info: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
};
