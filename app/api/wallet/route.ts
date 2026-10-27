
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Silakan login terlebih dahulu.' },
      { status: 401 },
    )
  }

  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('balance, updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (walletError) {
    console.error('Wallet query failed:', walletError.message)

    return NextResponse.json(
      { error: 'Gagal mengambil saldo.' },
      { status: 500 },
    )
  }

  if (!wallet) {
    return NextResponse.json(
      { error: 'Dompet pengguna belum tersedia.' },
      { status: 404 },
    )
  }

  const { data: transactions, error: transactionError } = await supabase
    .from('wallet_transactions')
    .select('id, type, amount, status, description, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (transactionError) {
    console.error(
      'Wallet transactions query failed:',
      transactionError.message,
    )

    return NextResponse.json(
      { error: 'Gagal mengambil riwayat transaksi.' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    balance: wallet.balance,
    updatedAt: wallet.updated_at,
    transactions: transactions ?? [],
  })
}
