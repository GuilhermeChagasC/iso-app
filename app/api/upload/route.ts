import { NextRequest, NextResponse } from 'next/server'
import { createJob } from '@/lib/jobStore'
import { writeFile } from 'fs/promises'
import { mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    const jobId = crypto.randomUUID()
    const fileName = file.name
    const filePath = path.join(uploadsDir, `${jobId}-${fileName}`)

    await writeFile(filePath, buffer)

    await createJob(jobId, { fileName, filePath })

    return NextResponse.json({
      success: true,
      jobId,
      fileName,
      filePath,
      size: file.size,
      type: file.type,
    })
  } catch (error: any) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}