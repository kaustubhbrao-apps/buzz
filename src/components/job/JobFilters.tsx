'use client';

import { useState } from 'react';
import type { LocationType, ExperienceLevel } from '@/types/database';

interface Filters { skill?: string; city?: string; locationType?: LocationType; experienceLevel?: ExperienceLevel; matchOpenTo?: boolean; }

export default function JobFilters({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap gap-2">
      <input type="text" placeholder="Search skills..." value={filters.skill ?? ''} onChange={(e) => update({ skill: e.target.value || undefined })} className="input max-w-[200px] py-2 text-[12px]" />
      <input type="text" placeholder="City" value={filters.city ?? ''} onChange={(e) => update({ city: e.target.value || undefined })} className="input max-w-[140px] py-2 text-[12px]" />
      <button onClick={() => update({ locationType: filters.locationType === 'remote' ? undefined : 'remote' })}
        className={`text-[12px] font-semibold rounded-full px-4 py-2 transition-all ${filters.locationType === 'remote' ? 'bg-[#0F0F0F] text-white' : 'bg-[#F5F5F5] text-[#0F0F0F]/60 hover:bg-[#EBEBEB]'}`}>
        Remote
      </button>
      <select value={filters.experienceLevel ?? ''} onChange={(e) => update({ experienceLevel: (e.target.value || undefined) as ExperienceLevel | undefined })}
        className="input max-w-[140px] py-2 text-[12px]">
        <option value="">Experience</option>
        <option value="fresher">Fresher</option>
        <option value="junior">Junior</option>
        <option value="mid">Mid</option>
        <option value="senior">Senior</option>
      </select>
    </div>
  );
}
