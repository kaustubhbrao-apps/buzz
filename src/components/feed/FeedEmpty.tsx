import Link from 'next/link';

interface FeedEmptyProps {
  tab: 'buzz' | 'latest';
}

export default function FeedEmpty({ tab }: FeedEmptyProps) {
  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-4">{tab === 'buzz' ? '🦗' : '👀'}</p>
      <h3 className="font-semibold mb-2">
        {tab === 'buzz' ? 'Your feed is quiet.' : 'Nothing here yet.'}
      </h3>
      <p className="text-sm text-buzz-muted mb-4">
        {tab === 'buzz'
          ? 'Follow people in your skill area to see their work here.'
          : 'Follow people and companies to see their posts here.'}
      </p>
      <Link href="/discover" className="btn-primary inline-block text-sm">
        Explore Discover →
      </Link>
    </div>
  );
}
