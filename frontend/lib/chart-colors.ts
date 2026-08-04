// Literal hex values mirroring tailwind.config.ts's design tokens. Recharts
// needs real colors for stroke/fill props — it can't read Tailwind classes —
// so this is the single source of truth those chart components pull from,
// kept in sync with the primary/risk colors used everywhere else in the UI.

export const CHART_COLORS = {
  primary: '#7C3AED',
  grid: '#E4E0F0',
  axisText: '#64748B',
  tooltipBg: '#FFFFFF',
  tooltipBorder: '#E4E0F0',
  risk: {
    high: '#E11D48',
    medium: '#D97706',
    low: '#059669',
  },
  series: {
    clicks: '#7C3AED',
    logins: '#059669',
    forum: '#D97706',
  },
} as const;

export const CHART_TOOLTIP_STYLE = {
  background: CHART_COLORS.tooltipBg,
  border: `1px solid ${CHART_COLORS.tooltipBorder}`,
  borderRadius: 10,
  fontSize: 12,
  boxShadow: '0 8px 20px -6px rgba(76, 29, 149, 0.15)',
};

export const CHART_AXIS_TICK = { fill: CHART_COLORS.axisText, fontSize: 11 };
export const CHART_AXIS_LINE = { stroke: CHART_COLORS.grid };
