import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getJob, updateJob } from '@/lib/jobStore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { sessionId, jobId } = await req.json()

    if (!sessionId || !jobId) {
      return NextResponse.json(
        { error: 'sessionId e jobId são obrigatórios' },
        { status: 400 }
      )
    }

    // 1️⃣ Buscar job
    const job = await getJob(jobId)
    if (!job) {
      return NextResponse.json(
        { error: 'Job não encontrado' },
        { status: 404 }
      )
    }

    // 2️⃣ Se já foi pago, retornar sucesso
    if (job.isPaid) {
      return NextResponse.json({ 
        success: true, 
        message: 'Pagamento já confirmado anteriormente' 
      })
    }

    // 3️⃣ Verificar sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // 4️⃣ Validar pagamento
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Pagamento não confirmado' },
        { status: 400 }
      )
    }

    // 5️⃣ Validar que o jobId corresponde
    if (session.metadata?.jobId !== jobId) {
      return NextResponse.json(
        { error: 'jobId não corresponde à sessão' },
        { status: 400 }
      )
    }

    // 6️⃣ ✅ MARCAR COMO PAGO
    await updateJob(jobId, {
      isPaid: true,
      paidAt: new Date(),
      status: 'paid',
    })

    // 7️⃣ Disparar geração do relatório completo (se necessário)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
    } catch (error) {
      console.error('Erro ao gerar relatório completo:', error)
      // Não falha a confirmação de pagamento por isso
    }

    return NextResponse.json({ 
      success: true,
      message: 'Pagamento confirmado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar pagamento' },
      { status: 500 }
    )
  }
}