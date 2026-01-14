'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function PreviewClient() {
  const params = useSearchParams();
  const router = useRouter();
  const jobId = params.get('jobId');

  async function goToCheckout() {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    });

    const data = await res.json();
    window.location.href = data.url;
  }

  return (
    <main style={{ padding: 60 }}>
      <h2>Resumo Inicial</h2>
      <p>Prévia da análise gerada com sucesso.</p>

      <button onClick={goToCheckout} style={{ marginTop: 24 }}>
        Liberar Relatório Completo
      </button>
    </main>
  );
}
