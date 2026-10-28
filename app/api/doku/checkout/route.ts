import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createDokuSignature, dokuConfig } from '@/lib/doku'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 })
  }

  let body: { amount?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 })
  }

  const amount = Number(body.amount)
  if (!Number.isInteger(amount) || amount < 10000 || amount > 10000000) {
    return NextResponse.json({ error: 'Nominal harus Rp10.000 sampai Rp10.000.000.' }, { status: 400 })
  }

  try {
    const config = dokuConfig()
    const requestId = randomUUID()
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
    const invoice = `NOKOS-${Date.now()}-${randomUUID().slice(0, 8)}`
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
      : new URL(request.url).origin

    const payload = {
      order: {
        amount,
        invoice_number: invoice,
        currency: 'IDR',
        callback_url: `${baseUrl}/topup/result`,
        callback_url_cancel: `${baseUrl}/topup/result?status=cancelled`,
        callback_url_result: `${baseUrl}/topup/result`,
      },
      payment: { payment_due_date: 60 },
      customer: {
        name: String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'Pelanggan').slice(0, 100),
        email: user.email ?? '',
      },
    }

    const rawBody = JSON.stringify(payload)
    const target = '/checkout/v1/payment'
    const signature = createDokuSignature(
      config.clientId,
      config.secretKey,
      requestId,
      timestamp,
      target,
      rawBody,
    )

    const dokuResponse = await fetch(`${config.endpoint}${target}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': config.clientId,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        Signature: signature,
      },
      body: rawBody,
      cache: 'no-store',
    })

    const result = await dokuResponse.json().catch(() => null)
    if (!dokuResponse.ok) {
      console.error('DOKU checkout creation failed:', dokuResponse.status)
      return NextResponse.json(
        { error: 'DOKU gagal membuat halaman pembayaran. Periksa konfigurasi merchant dan mode sandbox.' },
        { status: 502 },
      )
    }

    const paymentUrl = result?.response?.payment?.url ?? result?.payment?.url
    if (typeof paymentUrl !== 'string' || !paymentUrl.startsWith('https://')) {
      console.error('DOKU checkout response did not include a valid payment URL.')
      return NextResponse.json({ error: 'DOKU tidak mengembalikan tautan pembayaran yang valid.' }, { status: 502 })
    }

    return NextResponse.json({ paymentUrl, invoiceNumber: invoice })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('DOKU checkout setup failed:', message)
    return NextResponse.json(
      { error: message.includes('belum dikonfigurasi') || message.includes('DOKU_ENV')
        ? message
        : 'Gagal menyiapkan pembayaran DOKU.' },
      { status: 500 },
    )
  }
}
