import Image from 'next/image';
import type { AttachmentType } from '@/types/database';
import { ExternalLink, FileText } from 'lucide-react';

export default function PostAttachment({ url, type }: { url: string; type: AttachmentType }) {
  if (type === 'image') {
    return <div className="relative aspect-[16/9] bg-[#F5F5F3]"><Image src={url} alt="" fill className="object-cover" /></div>;
  }
  if (type === 'video') {
    return <video controls className="w-full max-h-[400px] bg-black"><source src={url} /></video>;
  }
  if (type === 'link') {
    const domain = (() => { try { return new URL(url).hostname; } catch { return url; } })();
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mx-5 mb-4 rounded-xl bg-[#F5F5F3] border border-[#EAEAE8] p-4 hover:border-[#DDD] transition-all">
        <div className="flex items-center gap-2 mb-1">
          <ExternalLink className="w-3.5 h-3.5 text-[#BBB]" />
          <span className="text-[11px] text-[#BBB] uppercase tracking-wider font-semibold">{domain}</span>
        </div>
        <p className="text-sm font-medium text-[#0F0F0F] truncate">{url}</p>
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="mx-5 mb-4 flex items-center gap-3 rounded-xl bg-[#F5F5F3] border border-[#EAEAE8] p-4 hover:border-[#DDD] transition-all">
      <FileText className="w-6 h-6 text-[#BBB]" /><span className="text-sm text-[#666] truncate">{url.split('/').pop()}</span>
    </a>
  );
}
