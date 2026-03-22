import Image from 'next/image';
import type { AttachmentType } from '@/types/database';
import { FileText } from 'lucide-react';

interface PostAttachmentProps {
  url: string;
  type: AttachmentType;
}

export default function PostAttachment({ url, type }: PostAttachmentProps) {
  if (type === 'image') {
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden bg-buzz-border">
        <Image src={url} alt="Post attachment" fill className="object-cover" />
      </div>
    );
  }

  if (type === 'video') {
    return (
      <video controls className="w-full rounded-lg max-h-[400px]">
        <source src={url} />
      </video>
    );
  }

  if (type === 'link') {
    const domain = (() => {
      try { return new URL(url).hostname; } catch { return url; }
    })();

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block card p-4 hover:shadow-lg transition-shadow"
      >
        <p className="text-sm font-medium text-buzz-text truncate">{url}</p>
        <p className="text-xs text-buzz-muted mt-1">{domain}</p>
      </a>
    );
  }

  // file
  const filename = url.split('/').pop() ?? 'File';
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 card p-4 hover:shadow-lg transition-shadow"
    >
      <FileText className="w-8 h-8 text-buzz-muted" />
      <span className="text-sm truncate">{filename}</span>
    </a>
  );
}
