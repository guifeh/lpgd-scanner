import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    try {
      const response = await fetch('https://formspree.io/f/manwzoak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="mt-8 p-4 rounded-2xl glass border border-emerald-500/20 text-center animate-fade-in">
        <div className="w-10 h-10 mx-auto bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-white mb-1">Email registrado!</h4>
        <p className="text-xs text-slate-400">Avisaremos assim que o plano completo for lançado.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-5 rounded-2xl glass border border-white/5 w-full max-w-sm mx-auto text-center animate-fade-in delay-500">
      <h4 className="text-sm font-semibold text-white mb-2">
        Gostou? Deixa seu email pra saber quando lançar o plano completo
      </h4>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          disabled={status === 'loading'}
          className="flex-1 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 focus:shadow-[0_0_15px_rgba(249,115,22,0.15)] transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center min-w-[80px]"
        >
          {status === 'loading' ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Avisar'
          )}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-400 mt-2 text-left">
          Ocorreu um erro ao registrar seu email. Tente novamente.
        </p>
      )}
      <p className="text-[10px] text-slate-500 mt-3">
        Substitua 'YOUR_FORM_ID' no código pelo seu ID do Formspree.
      </p>
    </div>
  );
}
