import { useState } from 'react';

interface UrlInputProps {
  onScan: (url: string) => void;
  isLoading: boolean;
}

export default function UrlInput({ onScan, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Por favor, insira uma URL.');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('A URL deve começar com http:// ou https://');
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      setError('URL inválida. Verifique o formato.');
      return;
    }

    onScan(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="glass rounded-2xl p-2 transition-all duration-300 hover:border-orange-500/30 focus-within:border-orange-500/40 focus-within:shadow-[0_0_30px_rgba(249,115,22,0.15)]">
        <div className="flex items-center gap-2">
          {/* Search Icon */}
          <div className="pl-4 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input */}
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            disabled={isLoading}
            placeholder="Digite a URL do site para analisar..."
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-white placeholder-slate-500 text-lg py-3 px-2 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Scan Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="shrink-0 relative flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base text-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
            style={{
              background: isLoading
                ? 'linear-gradient(135deg, #475569, #334155)'
                : 'linear-gradient(135deg, #f97316, #ea580c)',
            }}
          >
            {/* Glow effect on hover */}
            {!isLoading && (
              <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}

            <span className="relative flex items-center gap-2">
              {isLoading ? (
                <>
                  {/* Spinner */}
                  <svg className="h-5 w-5 animate-spin-slow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Analisando...</span>
                </>
              ) : (
                <>
                  {/* Shield Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Analisar</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm animate-fade-in px-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
