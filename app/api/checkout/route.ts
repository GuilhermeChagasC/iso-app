import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getJob } from '@/lib/jobStore'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function POST(req: Request) {
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
	
  const { jobId } = await req.json()
  const job = await getJob(jobId)

  if (!job) {
    return NextResponse.json(
      { error: 'Job não encontrado' },
      { status: 404 }
    )
  }

  // 🔒 Verificar se já foi pago
  if (job.isPaid) {
    return NextResponse.json(
      { error: 'Este relatório já foi pago', jobId: job.id },
      { status: 400 }
    )
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_STANDARD!,
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&jobId=${job.id}`,
      cancel_url: `${APP_URL}/upload?jobId=${job.id}`,
      metadata: { 
        jobId: job.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Erro ao criar sessão Stripe:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    )
  }
}