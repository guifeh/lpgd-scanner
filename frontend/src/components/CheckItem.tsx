import type { CheckResult } from '../types';

interface CheckItemProps {
  check: CheckResult;
  index: number;
}

export default function CheckItem({ check, index }: CheckItemProps) {
  const passed = check.passed;

  return (
    <div
      className="group glass rounded-xl p-6 transition-all duration-300 hover:translate-y-[-2px] hover:border-white/20 hover:shadow-lg opacity-0 animate-fade-in-up"
      style={{
        animationDelay: `${index * 80}ms`,
        animationFillMode: 'forwards',
        borderColor: passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
      }}
    >
      <div className="flex items-start gap-5">
        {/* Status Icon */}
        <div
          className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
            passed
              ? 'bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-red-500/15 text-red-400 group-hover:bg-red-500/25 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
          }`}
        >
          {passed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-white/90 transition-colors">
            {check.label}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 group-hover:text-slate-300 transition-colors">
            {check.evidence}
          </p>
          {!passed && check.fix_suggestion && (
            <div className="mt-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 transition-all duration-300">
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-orange-400 block mb-1">Como resolver:</span>
                  {check.fix_suggestion}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
            passed
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {passed ? 'Aprovado' : 'Reprovado'}
        </div>
      </div>
    </div>
  );
}
