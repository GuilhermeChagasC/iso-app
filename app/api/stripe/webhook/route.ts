import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { updateJob } from '@/lib/jobStore'
import { generateFullReport } from '@/lib/job.service'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()

  if (!sig) {
    return NextResponse.json({ error: 'Assinatura ausente' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const jobId = session.metadata?.jobId

    console.log('WEBHOOK RECEBIDO')
    console.log('JOB ID DO STRIPE:', jobId)

    if (!jobId) {
      console.log('WEBHOOK SEM JOB ID')
      return NextResponse.json({ error: 'jobId ausente' }, { status: 400 })
    }

    // 1. Marcar job como pago
    await updateJob(jobId, {
      isPaid: true,
      paidAt: new Date(),
      status: 'paid',
    })

    // 2. Gerar relatório completo
    await generateFullReport(jobId)

    console.log('JOB MARCADO COMO PAGO E PROCESSADO')
  }

  return NextResponse.json({ received: true })
}
