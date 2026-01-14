import { NextResponse } from 'next/server'
import { createJob } from '@/lib/jobStore'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const filePath = body.filePath

    if (typeof filePath !== 'string' || !filePath) {
      return NextResponse.json(
        { error: 'filePath é obrigatório' },
        { status: 400 }
      )
    }

    const jobId = randomUUID()

    const job = await createJob(jobId, { filePath })

    return NextResponse.json(job, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
