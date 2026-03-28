'use client';

import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { formatSalary, timeAgo } from '@/lib/utils';
import { Bookmark, MapPin, Banknote, Clock } from 'lucide-react';
import type { JobPost, CompanyProfile } from '@/types/database';

export default function JobCard({ job, onApply, userApplied }: { job: JobPost; onApply: () => void; userApplied: boolean }) {
  const [bookmarked, setBookmarked] = useState(false);
  const company = job.company as CompanyProfile | undefined;

  return (
    <div className="card-static p-5">
      <div className="flex items-start gap-3 mb-3">
        <Avatar src={company?.logo_url} name={company?.name ?? 'Co'} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#0F0F0F]">{company?.name}</span>
            {company?.verified && <Badge variant="verified">Verified</Badge>}
          </div>
          <span className="text-[11px] text-[#0F0F0F]/40">⭐ {company?.credibility_score?.toFixed(1)} · {company?.response_rate}% response</span>
        </div>
        <button onClick={() => setBookmarked(!bookmarked)} className="text-[#0F0F0F]/20 hover:text-[#0F0F0F]/50 transition-colors">
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-[#FFD60A] text-[#FFD60A]' : ''}`} />
        </button>
      </div>

      <h3 className="text-[15px] font-bold text-[#0F0F0F] mb-2">{job.title}</h3>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.skills_required?.map((s) => <span key={s} className="chip text-[#0F0F0F]/60">{s}</span>)}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#0F0F0F]/50 mb-3">
        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location_type === 'remote' ? 'Remote' : `${job.location_type} · ${job.city}`}</span>
        <span className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5" />{formatSalary(job.salary_min, job.salary_max)}</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(job.created_at)}</span>
      </div>

      <div className="bg-[#FFD60A]/10 rounded-2xl px-4 py-3 mb-4">
        <p className="text-[11px] font-bold text-[#0F0F0F]/60 uppercase tracking-wider mb-0.5">Show us</p>
        <p className="text-[13px] text-[#0F0F0F]/80">{job.proof_requirement}</p>
      </div>

      {userApplied ? (
        <button className="btn-secondary py-2 text-[12px]" disabled>Applied ✓</button>
      ) : (
        <button className="btn-primary py-2 text-[12px]" onClick={onApply}>Apply with Work Wall</button>
      )}
    </div>
  );
}
