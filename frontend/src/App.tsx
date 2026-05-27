import { useState, useCallback } from 'react';
import type { ScanReport } from './types';
import UrlInput from './components/UrlInput';
import ScoreCard from './components/ScoreCard';
import CheckItem from './components/CheckItem';

export default function App() {
  const [report, setReport] = useState<ScanReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(
          errData?.detail || `Erro do servidor (${response.status})`
        );
      }

      const data: ScanReport = await response.json();
      setReport(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro desconhecido ao analisar o site.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dismissError = () => setError(null);

  return (
    <div className="min-h-screen flex flex-col w-full">
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col px-6 md:px-12">
        {/* ─── Header ─── */}
        <header className="pt-16 pb-8 px-4 text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-3 mb-4">
          {/* Shield Logo */}
          <div className="relative w-14 h-14 shrink-0">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 animate-float">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            {/* Subtle glow */}
            <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 blur-xl opacity-30" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black tracking-tight">
              <span className="gradient-text">LGPD</span>{' '}
              <span className="text-white">Scanner</span>
            </h1>
          </div>
        </div>
        <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
          Verifique a conformidade LGPD do seu site com uma análise automatizada e detalhada
        </p>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 px-4 pb-16">
        {/* URL Input */}
        <section className="mb-12">
          <UrlInput onScan={handleScan} isLoading={isLoading} />
        </section>

        {/* Error Toast */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 animate-fade-in-up">
            <div className="glass rounded-xl p-4 border-red-500/30 flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-red-400 font-semibold text-sm">Erro na análise</h4>
                <p className="text-slate-400 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={dismissError}
                className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center gap-6 py-16 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-slate-700 border-t-orange-500 animate-spin-slow" />
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-orange-600 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">Analisando site...</p>
              <p className="text-slate-500 text-sm mt-1">Verificando conformidade com a LGPD</p>
            </div>
          </div>
        )}

        {/* Results */}
        {report && !isLoading && (
          <div className="max-w-3xl mx-auto">
            {/* Score Section */}
            <section className="mb-12">
              <ScoreCard report={report} />
            </section>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'forwards', opacity: 0 }}>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              <span className="text-slate-500 text-sm font-medium">Verificações Detalhadas</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            </div>

            {/* Check Items */}
            <section className="space-y-3">
              {report.checks.map((check, i) => (
                <CheckItem key={check.id} check={check} index={i} />
              ))}
            </section>

            {/* New Scan Button */}
            <div className="flex justify-center mt-12 animate-fade-in" style={{ animationDelay: `${report.checks.length * 80 + 200}ms`, animationFillMode: 'forwards', opacity: 0 }}>
              <button
                onClick={() => {
                  setReport(null);
                  setError(null);
                }}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl glass text-slate-300 hover:text-white font-medium transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Nova Análise</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State — when no results and not loading */}
        {!report && !isLoading && !error && (
          <div className="flex flex-col items-center gap-6 py-16 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards', opacity: 0 }}>
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 opacity-30"
                  style={{ animation: `float 2s ease-in-out ${i * 0.3}s infinite` }}
                />
              ))}
            </div>
            <p className="text-slate-600 text-sm">
              Insira uma URL acima para iniciar a verificação
            </p>
          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer className="py-6 px-4 text-center border-t border-slate-800/50">
        <p className="text-slate-600 text-xs">
          © {new Date().getFullYear()}{' '}
          <span className="gradient-text font-semibold">LGPD Scanner</span>
          {' '}— Análise automatizada de conformidade com a Lei Geral de Proteção de Dados
        </p>
      </footer>
      </div>
    </div>
  );
}
