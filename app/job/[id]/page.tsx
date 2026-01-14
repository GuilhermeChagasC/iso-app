'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CheckCircle2, Download, Lock, ArrowRight, FileText, Shield } from 'lucide-react'

interface JobData {
  id: string
  status: string
  summary: any
  isPaid: boolean
  paidAt: string | null
  fullResult: any
}

export default function JobPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  
  const [job, setJob] = useState<JobData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fullResult = job?.fullResult

  useEffect(() => {
    if (!jobId) return

    async function fetchJob() {
      try {
        const response = await fetch(`/api/job/${jobId}`)
        
        if (!response.ok) {
          throw new Error('Job não encontrado')
        }

        const data = await response.json()
        setJob(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar job')
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [jobId])

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Erro ao iniciar pagamento')
      }
    } catch (err) {
      setError('Erro ao processar checkout')
    }
  }

  const handleDownloadJSON = () => {
    window.location.href = `/api/export/json?jobId=${jobId}`
  }

  const handleDownloadPDF = () => {
    window.location.href = `/api/export/pdf?jobId=${jobId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600 mb-6">{error || 'Job não encontrado'}</p>
          <button
            onClick={() => router.push('/upload')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition"
          >
            Voltar ao Upload
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ISO Compliance
                </h1>
                <p className="text-xs text-gray-500">Relatório #{job.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Status Badge */}
          <div className="mb-6">
            {job.isPaid ? (
              <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Relatório Completo Liberado
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                <Lock className="w-4 h-4" />
                Preview Gratuito
              </span>
            )}
          </div>

          {/* Summary (Sempre visível) */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo da Análise</h2>
            
            {job.summary && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {job.summary.clausesCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Cláusulas Analisadas</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {job.summary.risksCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Riscos Identificados</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {job.summary.notesCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Observações</div>
                </div>
              </div>
            )}
          </div>

          {/* NÃO PAGO - Mostrar CTA de Pagamento */}
          {!job.isPaid && (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Libere o Relatório Completo</h3>
                  <p className="text-blue-100 mb-4">
                    Este é um resumo automático. O relatório completo inclui:
                  </p>
                  <ul className="space-y-2 text-blue-50">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Análise detalhada cláusula por cláusula
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Identificação de gaps de conformidade
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Recomendações práticas e acionáveis
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Exportação em JSON e PDF
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 px-6 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition flex items-center justify-center gap-2"
              >
                Liberar Relatório Completo
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* PAGO - Mostrar Relatório Completo e Downloads */}
          {job.isPaid && (
            <>
              {/* Download Buttons */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Exportar Relatório</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleDownloadJSON}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition"
                  >
                    <FileText className="w-5 h-5" />
                    Download JSON
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-indigo-50 text-indigo-600 rounded-xl font-medium hover:bg-indigo-100 transition"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Full Report */}
{job.fullResult && (
  <div className="space-y-6">
    {/* Cláusulas Analisadas */}
    {job.fullResult.clauses && job.fullResult.clauses.length > 0 && (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Cláusulas Analisadas</h3>
        <div className="space-y-4">
          {job.fullResult.clauses.map((clause: any) => (
            <div key={clause.id} className="border-l-4 pl-4 py-2" style={{
              borderColor: clause.status === 'conforme' ? '#10b981' : 
                          clause.status === 'parcial' ? '#f59e0b' : '#ef4444'
            }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{clause.id} - {clause.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{clause.description}</p>
                  {clause.recommendation && (
                    <p className="text-sm text-blue-600 mt-2">
                      💡 Recomendação: {clause.recommendation}
                    </p>
                  )}
                </div>
                <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                  clause.status === 'conforme' ? 'bg-green-100 text-green-700' :
                  clause.status === 'parcial' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {clause.status === 'conforme' ? 'Conforme' :
                   clause.status === 'parcial' ? 'Parcial' : 'Não Conforme'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Riscos Identificados */}
    {job.fullResult.risks && job.fullResult.risks.length > 0 && (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Riscos Identificados</h3>
        <div className="space-y-4">
          {job.fullResult.risks.map((risk: any) => (
            <div key={risk.id} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-red-900">{risk.id} - Cláusula {risk.clause}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  risk.severity === 'alto' ? 'bg-red-200 text-red-800' :
                  risk.severity === 'médio' ? 'bg-orange-200 text-orange-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {risk.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{risk.description}</p>
              <div className="text-sm">
                <p className="text-red-700"><strong>Impacto:</strong> {risk.impact}</p>
                <p className="text-green-700 mt-1"><strong>Mitigação:</strong> {risk.mitigation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Observações */}
    {fullResult?.notes && Array.isArray(fullResult.notes) && fullResult.notes.map((note: any) => (
  <div key={note.id} className={`p-4 rounded-lg border ${
    note.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
    note.type === 'success' ? 'bg-green-50 border-green-200' :
    'bg-blue-50 border-blue-200'
  }`}>
    <h4 className="font-semibold text-gray-900">{note.title}</h4>
    <p className="text-sm text-gray-700 mt-1">{note.content}</p>
  </div>
))}
  </div>
)}
            </>
          )}
        </div>
      </main>
    </div>
  )
}