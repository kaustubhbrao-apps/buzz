interface CredibilityRatingProps {
  score: number;
  responseRate: number;
  totalHires: number;
}

export default function CredibilityRating({ score, responseRate, totalHires }: CredibilityRatingProps) {
  if (score === 0) {
    return <p className="text-xs text-buzz-muted">New company — no rating yet</p>;
  }

  const fullStars = Math.floor(score);
  const hasHalf = score - fullStars >= 0.5;

  return (
    <div title="Credibility rating based on response rate, hires, and candidate reviews">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">⭐ {score.toFixed(1)}</span>
        <span className="text-xs text-buzz-muted">Credibility Rating</span>
        <span className="flex ml-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-xs">
              {i < fullStars ? '★' : i === fullStars && hasHalf ? '½' : '☆'}
            </span>
          ))}
        </span>
      </div>
      <p className="text-xs text-buzz-muted mt-0.5">
        {responseRate}% response rate · {totalHires} hires confirmed on Buzz
      </p>
    </div>
  );
}
