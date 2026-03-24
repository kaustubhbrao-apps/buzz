'use client';

import { Shield } from 'lucide-react';

const LEVELS = [
  { min: 85, label: 'Excellent', color: '#16A34A', bg: '#F0FDF4' },
  { min: 65, label: 'Good', color: '#2563EB', bg: '#EFF6FF' },
  { min: 40, label: 'Fair', color: '#D97706', bg: '#FFFBEB' },
  { min: 1, label: 'Poor', color: '#DC2626', bg: '#FEF2F2' },
  { min: 0, label: 'New', color: '#9CA3AF', bg: '#F9FAFB' },
];

function getLevel(score: number) {
  return LEVELS.find(l => score >= l.min) ?? LEVELS[LEVELS.length - 1];
}

export default function CredibilityBadge({
  score,
  responseRate,
  totalHires,
  size = 'md',
}: {
  score: number;
  responseRate: number;
  totalHires: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const level = getLevel(score);

  if (size === 'sm') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
        style={{ color: level.color, backgroundColor: level.bg }}
      >
        <Shield className="w-3 h-3" />
        {level.label}
      </span>
    );
  }

  return (
    <div className="card-static p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5" style={{ color: level.color }} />
        <h3 className="text-[13px] font-bold text-[#0F0F0F]">Company Credibility</h3>
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-semibold" style={{ color: level.color }}>{level.label}</span>
          <span className="text-[12px] font-bold text-[#0F0F0F]">{score}/100</span>
        </div>
        <div className="h-2 rounded-full bg-[#F0F0F0]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: level.color }}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#888]">Response rate</span>
          <span className="text-[13px] font-semibold text-[#0F0F0F]">
            {Math.round(responseRate * 100)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#888]">Total hires</span>
          <span className="text-[13px] font-semibold text-[#0F0F0F]">{totalHires}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#888]">Responds to</span>
          <span className="text-[12px] font-medium" style={{ color: level.color }}>
            {responseRate >= 0.8 ? 'Most applicants' : responseRate >= 0.5 ? 'Some applicants' : responseRate > 0 ? 'Few applicants' : 'No data yet'}
          </span>
        </div>
      </div>
    </div>
  );
}
