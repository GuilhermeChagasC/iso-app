import { NextResponse } from 'next/server'

export async function GET() {
  console.log('PING OK')
  return NextResponse.json({ pong: true })
}
