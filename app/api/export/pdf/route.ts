import { NextRequest, NextResponse } from 'next/server'
import { getJob } from '@/lib/jobStore'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get('jobId')
    
    if (!jobId) {
      return NextResponse.json({ error: 'jobId necessário' }, { status: 400 })
    }

    const job = await getJob(jobId)
    
    if (!job || !job.fullResult) {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 })
    }

    const { clauses, risks, notes } = job.fullResult as any

    // Criar PDF
    const doc = new jsPDF()
    
    // Título
    doc.setFontSize(20)
    doc.text('Relatório de Análise ISO', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text(`Job ID: ${jobId}`, 105, 30, { align: 'center' })
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 105, 36, { align: 'center' })
    
    // Resumo
    doc.setFontSize(14)
    doc.text('Resumo Executivo', 14, 50)
    
    doc.setFontSize(10)
    doc.text(`Total de Cláusulas: ${clauses?.length || 0}`, 14, 58)
    doc.text(`Riscos Identificados: ${risks?.length || 0}`, 14, 64)
    doc.text(`Observações: ${notes?.length || 0}`, 14, 70)

    // Tabela de Cláusulas
    if (clauses && clauses.length > 0) {
      autoTable(doc, {
        startY: 80,
        head: [['Cláusula', 'Título', 'Status', 'Descrição']],
        body: clauses.map((c: any) => [
          c.id,
          c.title,
          c.status === 'conforme' ? 'Conforme' : c.status === 'parcial' ? 'Parcial' : 'Não Conforme',
          c.description
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 },
      })
    }

    // Nova página para riscos
    if (risks && risks.length > 0) {
      doc.addPage()
      doc.setFontSize(14)
      doc.text('Riscos Identificados', 14, 20)

      autoTable(doc, {
        startY: 30,
        head: [['ID', 'Severidade', 'Título', 'Descrição']],
        body: risks.map((r: any) => [
          r.id,
          r.severity.toUpperCase(),
          r.title,
          r.description
        ]),
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] },
        styles: { fontSize: 8 },
      })
    }

    // Gerar PDF como buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-iso-${jobId}.pdf"`
      }
    })

  } catch (error: any) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}