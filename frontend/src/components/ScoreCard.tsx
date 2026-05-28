import { useEffect, useRef, useState } from 'react';
import type { ScanReport } from '../types';
import NewsletterForm from './NewsletterForm';

interface ScoreCardProps {
  report: ScanReport;
}

function getScoreColor(score: number): { stroke: string; text: string; glow: string; bg: string } {
  if (score < 50)
    return {
      stroke: '#ef4444',
      text: 'text-red-400',
      glow: 'rgba(239, 68, 68, 0.3)',
      bg: 'from-red-500/10 to-red-600/5',
    };
  if (score < 80)
    return {
      stroke: '#f59e0b',
      text: 'text-amber-400',
      glow: 'rgba(245, 158, 11, 0.3)',
      bg: 'from-amber-500/10 to-amber-600/5',
    };
  return {
    stroke: '#10b981',
    text: 'text-emerald-400',
    glow: 'rgba(16, 185, 129, 0.3)',
    bg: 'from-emerald-500/10 to-emerald-600/5',
  };
}

function getScoreLabel(score: number): string {
  if (score < 50) return 'Conformidade Baixa';
  if (score < 80) return 'Conformidade Parcial';
  return 'Boa Conformidade';
}

export default function ScoreCard({ report }: ScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const ringRef = useRef<SVGCircleElement>(null);
  const colors = getScoreColor(report.score);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (report.score / 100) * circumference;

  // Animate score number counting up
  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();
    const target = report.score;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [report.score]);

  const formattedDate = new Date(report.scanned_at).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const passedCount = report.checks.filter((c) => c.passed).length;
  const totalCount = report.checks.length;

  return (
    <div className="animate-score-reveal flex flex-col items-center gap-6">
      {/* Score Ring */}
      <div className="relative">
        {/* Glow behind the ring */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-50 transition-opacity duration-1000"
          style={{ background: `radial-gradient(circle, ${colors.glow}, transparent 70%)` }}
        />

        <svg
          width="240"
          height="240"
          viewBox="0 0 240 240"
          className="relative transform -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Progress ring */}
          <circle
            ref={ringRef}
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            className="score-ring-animated"
            style={
              {
                '--ring-circumference': circumference,
                '--ring-offset': offset,
                filter: `drop-shadow(0 0 8px ${colors.glow})`,
              } as React.CSSProperties
            }
          />
        </svg>

        {/* Score Number in the center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-7xl font-black tabular-nums ${colors.text}`}>
            {animatedScore}
          </span>
          <span className="text-slate-400 text-sm font-medium mt-1">de 100</span>
        </div>
      </div>

      {/* Score Label */}
      <div
        className={`px-5 py-2 rounded-full bg-gradient-to-r ${colors.bg} border border-white/5 backdrop-blur-sm`}
      >
        <span className={`text-sm font-semibold ${colors.text}`}>
          {getScoreLabel(report.score)}
        </span>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{passedCount} aprovados</span>
        </div>
        <div className="w-px h-4 bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span>{totalCount - passedCount} reprovados</span>
        </div>
      </div>

      {/* URL and Timestamp */}
      <div className="flex flex-col items-center gap-1.5 mt-2">
        <div className="flex items-center gap-2 text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="text-sm font-medium truncate max-w-xs">{report.url}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Verificado em {formattedDate}</span>
        </div>
      </div>

      <NewsletterForm />
    </div>
  );
}
