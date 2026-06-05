// Netlify Function: starts a MyFatoorah payment for a subscription plan.
// Secrets (Netlify env vars): MYFATOORAH_TOKEN, MYFATOORAH_BASE, MYFATOORAH_CURRENCY, SITE_URL
const PRICES = { student: 5, economy: 60, pro: 100 }

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })

export default async (req) => {
  if (req.method === 'OPTIONS')
    return new Response('', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } })
  if (req.method !== 'POST') return json({ error: 'method' }, 405)

  const token = process.env.MYFATOORAH_TOKEN
  if (!token) return json({ error: 'not_configured' }, 503)
  const base = process.env.MYFATOORAH_BASE || 'https://apitest.myfatoorah.com'
  const currency = process.env.MYFATOORAH_CURRENCY || 'USD'
  const siteUrl = (process.env.SITE_URL || 'https://dentacare0.netlify.app').replace(/\/$/, '')

  let payload
  try { payload = await req.json() } catch { return json({ error: 'bad_json' }, 400) }
  const { tier, clinicId, customerName, email, phone } = payload || {}
  const amount = PRICES[tier]
  if (!amount || !clinicId) return json({ error: 'bad_request' }, 400)

  const body = {
    CustomerName: customerName || 'Clinic',
    NotificationOption: 'LNK',
    InvoiceValue: amount,
    DisplayCurrencyIso: currency,
    CustomerEmail: email || undefined,
    MobileCountryCode: phone ? '+962' : undefined,
    CustomerMobile: phone || undefined,
    CallBackUrl: `${siteUrl}/?payment=return`,
    ErrorUrl: `${siteUrl}/?payment=error`,
    CustomerReference: `${clinicId}:${tier}`,
    Language: 'AR',
  }

  try {
    const r = await fetch(`${base}/v2/SendPayment`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await r.json()
    if (!data.IsSuccess) return json({ error: 'mf_failed', message: data.Message, details: data.ValidationErrors }, 400)
    return json({ url: data.Data.InvoiceURL, invoiceId: data.Data.InvoiceId })
  } catch (e) {
    return json({ error: 'request_failed', message: String(e) }, 500)
  }
}
