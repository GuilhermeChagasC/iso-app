import { NextResponse } from 'next/server'
import { getJob } from '@/lib/jobStore'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json({ error: 'jobId obrigatório' }, { status: 400 })
  }

  const job = await getJob(jobId)

  // 🔒 Bloqueio: só libera se pagamento confirmado
  if (!job || !job.isPaid) {
    return NextResponse.json(
      { error: 'Pagamento necessário para acessar o relatório completo' },
      { status: 403 }
    )
  }

  // ✅ Pagamento confirmado - libera relatório
  return NextResponse.json(job.fullResult, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="relatorio-${jobId}.json"`,
    },
  })
}