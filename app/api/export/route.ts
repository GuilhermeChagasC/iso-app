import { NextResponse } from 'next/server';
import { getJob } from '@/lib/jobStore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId é obrigatório' }, { status: 400 });
  }

  const job = await getJob(jobId);

  if (!job || job.status !== 'done' || !job.fullResult) {
    return NextResponse.json(
      { error: 'Relatório não disponível' },
      { status: 403 }
    );
  }

  return new NextResponse(
    JSON.stringify(job.fullResult, null, 2),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="relatorio-${job.id}.json"`,
      },
    }
  );
}
