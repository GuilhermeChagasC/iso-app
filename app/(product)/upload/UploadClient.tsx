'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, FileText, CheckCircle2, Shield, Zap, Award, ArrowRight, Clock, Lock } from 'lucide-react'

type FlowStep = 'upload' | 'preview' | 'checkout' | 'processing' | 'done'

export default function UploadClient() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<any>(null)

  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [step, setStep] = useState<FlowStep>('upload')
  const [jobId, setJobId] = useState<string | null>(null)

  const params = useSearchParams()
  const paid = params.get('paid')
  const paidJobId = params.get('jobId')

  /* ================= RETORNO DO CHECKOUT ================= */

  useEffect(() => {
    if (paid && paidJobId) {
      async function generateFull() {
        setStep('processing')

        const res = await fetch('/api/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: paidJobId }),
        })

        if (res.ok) {
          setStep('done')
          router.push(`/job/${paidJobId}`)
        }
      }

      generateFull()
    }
  }, [paid, paidJobId, router])

  /* ================= FILE HANDLING ================= */

  function validateFiles(selected: File[]) {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]

    return selected.some(f => !allowed.includes(f.type))
      ? 'Formato inválido. Envie PDF, DOCX ou PPTX.'
      : null
  }

  function handleFiles(selected: File[]) {
    const err = validateFiles(selected)
    if (err) {
      setError(err)
      setFiles([])
      return
    }

    setError(null)
    setFiles(selected)
  }

  const file = files[0]

  /* ================= PREVIEW ================= */

const handlePreview = async (jobId: string, fileName: string, filePath: string) => {
  try {
    setLoading(true)
    console.log('▶️ GERANDO PREVIEW:', { jobId, fileName, filePath })

    const res = await fetch('/api/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, fileName, filePath, locale: 'pt-PT', scope: '9001' }),
    })

    if (!res.ok) throw new Error('Preview failed')

    const data = await res.json()
    console.log('✅ PREVIEW RECEBIDO:', data)
    
    setPreview(data)
    setJobId(data.jobId || jobId)
    setStep('preview')

  } catch (err) {
    console.error('❌ Erro preview:', err)
    setError('Erro ao gerar preview')
  } finally {
    setLoading(false)
  }
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
                <p className="text-xs text-gray-500">ISO 9001 · ISO 14001</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-gray-600 hover:text-blue-600 transition">
                Recursos
              </a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-blue-600 transition">
                Como Funciona
              </a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-blue-600 transition">
                Preços
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 'upload' && (
          <>
            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Análise Automatizada com IA
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Análise de Conformidade
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ISO 9001 & ISO 14001
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Carregue seus documentos e receba uma análise completa de conformidade em minutos.
                Identifique riscos e garanta a certificação.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Rápido</h3>
                  <p className="text-sm text-gray-600">Análise completa em minutos</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Seguro</h3>
                  <p className="text-sm text-gray-600">Seus dados protegidos</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Preciso</h3>
                  <p className="text-sm text-gray-600">IA treinada em normas ISO</p>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Envie Seus Documentos
                  </h2>
                  <p className="text-gray-600">
                    Arraste e solte ou clique para selecionar
                  </p>
                </div>

                <div
                  className={`
                    relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                    transition-all duration-200 ease-in-out
                    ${dragOver 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }
                    ${files.length > 0 ? 'border-green-500 bg-green-50' : ''}
                  `}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    handleFiles(Array.from(e.dataTransfer.files))
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    {files.length === 0 ? (
                      <>
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-700 mb-1">
                            Arraste seus arquivos aqui
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            ou clique para selecionar
                          </p>
                          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition">
                            <FileText className="w-4 h-4" />
                            Selecionar Arquivos
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900 mb-1">
                            {files.length} arquivo{files.length > 1 ? 's' : ''} selecionado{files.length > 1 ? 's' : ''}
                          </p>
                          <div className="mt-3 space-y-2">
                            {files.map((file, i) => (
                              <div key={i} className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-700">{file.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Formatos aceitos: PDF, DOCX, PPTX
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.pptx"
                    className="hidden"
                    onChange={(e) => {
                      if (!e.target.files) return
                      handleFiles(Array.from(e.target.files))
                    }}
                  />
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 text-center">{error}</p>
                  </div>
                )}

                <button
                  className={`
                    w-full mt-8 py-4 px-6 rounded-xl font-semibold text-lg
                    transition-all duration-200
                    ${files.length === 0 || loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:scale-105'
                    }
                  `}
                  disabled={!file || loading}
                  onClick={async () => {
                    if (!file) return

                    try {
                      setLoading(true)
                      setError(null)

                      const formData = new FormData()
                      formData.append('file', file)

                      const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                      })

                      if (!uploadRes.ok) {
                        throw new Error('Upload failed')
                      }

                      const uploadData = await uploadRes.json()
                      console.log('✅ UPLOAD OK:', uploadData)

                      const newJobId = uploadData.jobId
                      setJobId(newJobId)

                      await handlePreview(newJobId, uploadData.fileName, uploadData.filePath)

                    } catch (err) {
                      console.error(err)
                      setError('Erro ao processar arquivo')
                    } finally {
                      setLoading(false)
                    }
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Iniciar Análise
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </button>

                <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    <span>Seguro & Privado</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Conformidade GDPR</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= PREVIEW ================= */}
        {step === 'preview' && preview && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Análise Concluída</h2>
                    <p className="text-blue-100">Resumo inicial do seu documento</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-8 bg-gray-50">
                <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {preview?.summary?.clausesCount ?? 0}
                  </div>
                  <div className="text-sm text-gray-600">Cláusulas Analisadas</div>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {preview?.summary?.risksCount ?? 0}
                  </div>
                  <div className="text-sm text-gray-600">Riscos Identificados</div>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {preview?.summary?.notesCount?? 0}
                  </div>
                  <div className="text-sm text-gray-600">Observações</div>
                </div>
              </div>

              {/* Info */}
              <div className="p-8">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Relatório Completo Disponível
                  </h3>
                  <p className="text-sm text-blue-800 mb-4">
                    Este é um resumo automático. O relatório completo inclui análise detalhada,
                    riscos críticos, recomendações específicas e plano de ação.
                  </p>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Análise cláusula por cláusula
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Identificação de gaps de conformidade
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Recomendações práticas e acionáveis
                    </li>
                  </ul>
                </div>

                <button
                  className={`
                    w-full py-4 px-6 rounded-xl font-semibold text-lg
                    transition-all duration-200
                    ${!jobId
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:scale-105'
                    }
                  `}
                  disabled={!jobId}
                  onClick={async () => {
                    if (!jobId) {
                      setError('Job inválido. Refaça o upload.')
                      return
                    }

                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ jobId }),
                    })

                    const data = await res.json()

                    if (data.url) {
                      window.location.href = data.url
                    } else {
                      setError('Erro ao iniciar pagamento')
                    }
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    Liberar Relatório Completo
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </button>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 text-center">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Processamento Seguro
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Dados Protegidos
              </span>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 ISO Compliance. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
