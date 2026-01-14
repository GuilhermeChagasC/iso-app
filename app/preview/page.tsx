import { Suspense } from 'react'
import PreviewClient from './PreviewClient'

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <PreviewClient />
    </Suspense>
  )
}
