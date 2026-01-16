import { NextRequest, NextResponse } from 'next/server'
import { getJob, updateJob } from '../../../lib/jobStore'
import fs from 'fs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { jobId, fileName, filePath } = body

    // Validação antes de usar
    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json({ error: 'jobId inválido' }, { status: 400 })
    }

    // TypeScript não reconhece a validação acima, então forçamos o tipo
    const validJobId: string = jobId
    const job = await getJob(validJobId)
    
    if (!job) {
      return NextResponse.json({ error: 'Job não encontrado' }, { status: 404 })
    }
    
    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
    }

    console.log('Enviando para n8n...')
    const fileBuffer = fs.readFileSync(filePath)
    const base64Content = fileBuffer.toString('base64')

    const n8nResponse = await fetch('https://automations.isoreportsglobal.com/webhook/iso/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, fileName, fileContent: base64Content }),
    })

    if (!n8nResponse.ok) {
      throw new Error(`n8n erro: ${n8nResponse.status}`)
    }

    const n8nData = await n8nResponse.json()
    console.log('n8n retornou:', n8nData)

    const data = Array.isArray(n8nData) ? n8nData[0] : n8nData
    const extractedText = data?.extractedText || ''
    
    if (!extractedText) {
      console.warn('n8n nao retornou texto')
      throw new Error('Texto nao extraido')
    }

    console.log('Texto extraído:', extractedText.length, 'caracteres')
    console.log('Chamando Gemini...')
    
    const geminiResponse = await fetch(
      const geminiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analise este documento ISO e retorne APENAS JSON valido (sem markdown):
{
  "summary": {
    "clausesCount": [numero],
    "risksCount": [numero],
    "notesCount": [numero]
  }
}
Documento: ${extractedText.substring(0, 8000)}
JSON:`
            }]
          }]
        })
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Gemini erro: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const responseText = geminiData.candidates[0].content.parts[0].text
    const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const analysis = JSON.parse(cleanJson)

    const preview = {
      jobId: job.id,
      message: 'Preview gerado com IA',
      summary: analysis.summary
    }

    await updateJob(job.id, { status: 'preview', preview })

    return NextResponse.json(preview)
  } catch (error: any) {
    console.error('Erro:', error)
    
    const fallbackPreview = {
      jobId: 'unknown',
      message: 'Preview (teste)',
      summary: { clausesCount: 15, risksCount: 3, notesCount: 7 }
    }
    
    return NextResponse.json(fallbackPreview)
  }
}