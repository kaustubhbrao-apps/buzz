import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'timeago.js';
import type { OpenToType, ReactionType, CompanySize } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: Date | string): string {
  return format(date);
}

export function formatSalary(min: number, max: number): string {
  const fmt = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };
  return `${fmt(min)} – ${fmt(max)} PA`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export const OPEN_TO_LABELS: Record<OpenToType, string> = {
  full_time: 'Full-time roles',
  freelance: 'Freelance work',
  collab: 'Collaborations',
  mentorship: 'Mentorship',
  not_looking: 'Not looking',
};

export const REACTION_CONFIG: Record<ReactionType, { emoji: string; label: string; points: number }> = {
  inspired: { emoji: '⚡', label: 'Inspired', points: 5 },
  learned: { emoji: '🧠', label: 'Learned', points: 8 },
  collab: { emoji: '🤝', label: 'Collab', points: 15 },
  hire: { emoji: '💼', label: 'Hire', points: 25 },
};

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  '1_10': '1–10 employees',
  '11_50': '11–50 employees',
  '51_200': '51–200 employees',
  '201_500': '201–500 employees',
  '500_plus': '500+ employees',
};

export const INDUSTRIES = [
  'Technology',
  'E-commerce',
  'Fintech',
  'Edtech',
  'Healthtech',
  'SaaS',
  'Media & Entertainment',
  'D2C Brands',
  'Logistics',
  'Agritech',
  'Real Estate',
  'Gaming',
  'AI / ML',
  'Consulting',
  'Manufacturing',
  'Automotive',
  'Sustainability',
  'Government & Public Sector',
] as const;
