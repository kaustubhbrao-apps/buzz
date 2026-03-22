'use client';

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CredibilityRating from './CredibilityRating';
import { COMPANY_SIZE_LABELS } from '@/lib/utils';
import type { CompanyProfile } from '@/types/database';

interface CompanyHeaderProps {
  company: CompanyProfile;
  isAdmin: boolean;
  followerCount: number;
}

export default function CompanyHeader({ company, isAdmin, followerCount }: CompanyHeaderProps) {
  return (
    <div>
      {company.cover_url && (
        <div className="h-40 rounded-t-card overflow-hidden -mx-4 -mt-4 mb-4">
          <img src={company.cover_url} alt="Cover" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start gap-4">
        <Avatar src={company.logo_url} name={company.name} size="lg" />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{company.name}</h1>
            {company.verified ? (
              <Badge variant="verified">Verified</Badge>
            ) : (
              <Badge variant="unverified">Unverified</Badge>
            )}
          </div>

          <p className="text-sm text-buzz-muted mt-1">
            {[
              company.industry,
              company.size ? COMPANY_SIZE_LABELS[company.size] : null,
              company.city,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>

          <div className="mt-2">
            <CredibilityRating
              score={company.credibility_score}
              responseRate={company.response_rate}
              totalHires={company.total_hires}
            />
          </div>

          <p className="text-sm text-buzz-muted mt-1">{followerCount} followers</p>

          <div className="flex gap-2 mt-4">
            {isAdmin ? (
              <>
                <Button variant="secondary" size="sm">Edit page</Button>
                <Button size="sm">Post a job</Button>
                <Button variant="ghost" size="sm">Share page</Button>
              </>
            ) : (
              <>
                <Button size="sm">Follow</Button>
                <Button variant="secondary" size="sm">View open roles</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
