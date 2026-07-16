export const ThemeTokens = {
  colors: {
    background: "bg-[#0b0f19]", // dark theme base background
    surface: "bg-[#111827]",    // panels, sections backgrounds
    panel: "bg-[#1f2937]",      // component wrappers, alerts popups
    border: "border-[#374151]",  // general border divider lines
    hover: "hover:bg-[#374151]", // active hover state
    success: "text-[#10b981]",  // green severity
    warning: "text-[#f59e0b]",  // orange/yellow severity
    critical: "text-[#ef4444]", // bright red severity
    neutral: "text-[#9ca3af]",  // gray neutral text
    textPrimary: "text-[#f3f4f6]",   // bright readable text
    textSecondary: "text-[#9ca3af]", // medium muted text
    textMuted: "text-[#6b7280]"       // disabled/placeholder text
  },
  radius: {
    lg: "rounded-lg",
    md: "rounded-md",
    sm: "rounded-sm"
  },
  typography: {
    heading: "font-sans font-semibold tracking-tight text-slate-100",
    body: "font-sans text-slate-300 text-sm",
    mono: "font-mono text-xs tracking-wider"
  }
};
