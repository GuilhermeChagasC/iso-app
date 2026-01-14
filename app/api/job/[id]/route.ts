import { NextResponse } from 'next/server'
import { getJob } from '@/lib/jobStore'

type JobPreview = {
  summary?: string
}

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  req: Request,
  context: RouteContext
) {
  const { id } = await context.params

  const job = await getJob(id)

  if (!job) {
    return NextResponse.json(
      { error: 'Job não encontrado' },
      { status: 404 }
    )
  }

 const preview =
  job.preview &&
  typeof job.preview === 'object' &&
  !Array.isArray(job.preview)
    ? (job.preview as JobPreview)
    : null

return NextResponse.json({
  id: job.id,
  status: job.status,
  summary: preview?.summary ?? null,
  isPaid: job.isPaid,
  paidAt: job.paidAt,
  fullResult: job.isPaid ? job.fullResult : null,
})
}
