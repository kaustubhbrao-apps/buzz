'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LocationType, ExperienceLevel } from '@/types/database';

interface Filters {
  skill?: string;
  city?: string;
  locationType?: LocationType;
  experienceLevel?: ExperienceLevel;
  matchOpenTo?: boolean;
}

interface JobFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function JobFilters({ filters, onChange }: JobFiltersProps) {
  const [open, setOpen] = useState(false);

  const activeCount = Object.values(filters).filter(Boolean).length;

  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const clear = () => onChange({});

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Search skills..."
          value={filters.skill ?? ''}
          onChange={(e) => update({ skill: e.target.value || undefined })}
          className="input flex-1"
        />
        <button
          onClick={() => setOpen(!open)}
          className={cn('btn-secondary flex items-center gap-1.5 md:hidden', activeCount > 0 && 'border-buzz-yellow')}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="bg-buzz-yellow text-buzz-dark text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3 mb-4', !open && 'hidden md:grid')}>
        <input
          type="text"
          placeholder="City"
          value={filters.city ?? ''}
          onChange={(e) => update({ city: e.target.value || undefined })}
          className="input"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.locationType === 'remote'}
            onChange={(e) => update({ locationType: e.target.checked ? 'remote' : undefined })}
            className="rounded"
          />
          Remote only
        </label>

        <select
          value={filters.experienceLevel ?? ''}
          onChange={(e) => update({ experienceLevel: (e.target.value || undefined) as ExperienceLevel | undefined })}
          className="input"
        >
          <option value="">Experience level</option>
          <option value="fresher">Fresher</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.matchOpenTo ?? false}
            onChange={(e) => update({ matchOpenTo: e.target.checked || undefined })}
            className="rounded"
          />
          Match my Open To
        </label>
      </div>

      {activeCount > 0 && (
        <button onClick={clear} className="text-xs text-buzz-muted hover:underline flex items-center gap-1 mb-3">
          <X className="w-3 h-3" /> Clear all filters
        </button>
      )}
    </div>
  );
}
