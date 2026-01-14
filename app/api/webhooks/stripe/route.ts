import { NextRequest, NextResponse } from 'next/server'
import { updateJob } from '@/lib/jobStore'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.text() // Use text() não json()
    const signature = req.headers.get('stripe-signature')
    
    if (!signature) {
      console.error('Signature ausente')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET não configurado')
      return NextResponse.json({ error: 'Webhook secret não configurado' }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('❌ Erro ao verificar webhook:', err)
      return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
    }

    console.log('✅ Webhook verificado:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const jobId = session.metadata?.jobId

      if (jobId) {
        console.log('💳 Pagamento confirmado para job:', jobId)

        await updateJob(jobId, {
          isPaid: true,
          paidAt: new Date(),
        })

        // Gerar relatório completo automaticamente
        const appUrl = process.env.APP_URL || 'http://localhost:3000'
        
        try {
          const fullResponse = await fetch(`${appUrl}/api/full`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId }),
          })

          if (fullResponse.ok) {
            console.log('✅ Relatório completo gerado automaticamente')
          } else {
            console.error('Erro ao gerar relatório completo:', await fullResponse.text())
          }
        } catch (error) {
          console.error('Erro ao chamar /api/full:', error)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}