import { getJob, updateJob } from '@/lib/jobStore'

export async function generateFullReport(jobId: string) {
  const job = await getJob(jobId)

  if (!job) {
    throw new Error('Job não encontrado')
  }

  // Marcar como processando
  await updateJob(jobId, {
    status: 'processing',
  })

  // ⚠️ Aqui entrará sua IA real futuramente
  const fullResult = {
    summary: job.preview ?? {},
    clauses: [],
    risks: [],
    notes: [],
  }

  // Salvar resultado final
  await updateJob(jobId, {
    status: 'completed',
    fullResult,
  })

  return fullResult
}
