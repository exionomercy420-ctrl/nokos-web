import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export function dokuConfig() {
  const clientId = process.env.DOKU_CLIENT_ID
  const secretKey = process.env.DOKU_SECRET_KEY
  const mode = process.env.DOKU_ENV ?? 'sandbox'

  if (!clientId || !secretKey) {
    throw new Error('DOKU_CLIENT_ID dan DOKU_SECRET_KEY belum dikonfigurasi.')
  }
  if (mode !== 'sandbox' && mode !== 'production') {
    throw new Error('DOKU_ENV harus sandbox atau production.')
  }

  return {
    clientId,
    secretKey,
    endpoint: mode === 'production'
      ? 'https://api.doku.com'
      : 'https://api-sandbox.doku.com',
  }
}

export function createDokuSignature(
  clientId: string,
  secretKey: string,
  requestId: string,
  timestamp: string,
  target: string,
  rawBody: string,
) {
  const digest = createHash('sha256').update(rawBody, 'utf8').digest('base64')
  const components = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${timestamp}`,
    `Request-Target:${target}`,
    `Digest:${digest}`,
  ].join('\n')
  return `HMACSHA256=${createHmac('sha256', secretKey).update(components).digest('base64')}`
}

export function verifyDokuSignature(
  expected: string,
  received: string | null,
) {
  if (!received) return false
  const left = Buffer.from(expected)
  const right = Buffer.from(received)
  return left.length === right.length && timingSafeEqual(left, right)
}
