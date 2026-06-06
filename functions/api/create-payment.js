// Cloudflare Pages Function: starts a MyFatoorah payment for a subscription plan.
// Route: POST /api/create-payment
// Env vars (Cloudflare Pages → Settings → Environment variables):
//   MYFATOORAH_TOKEN, MYFATOORAH_BASE, MYFATOORAH_CURRENCY, SITE_URL (optional)
const PRICES = { student: 5, economy: 60, pro: 100 }

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })

export const onRequestOptions = () =>
  new Response('', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  })

export const onRequestPost = async ({ request, env }) => {
  const token = env.MYFATOORAH_TOKEN
  if (!token) return json({ error: 'not_configured' }, 503)
  const base = env.MYFATOORAH_BASE || 'https://apitest.myfatoorah.com'
  const currency = env.MYFATOORAH_CURRENCY || 'USD'
  // Default to the live deployment origin (e.g. https://your-app.pages.dev) so the
  // payment redirect always returns to this site even without setting SITE_URL.
  const siteUrl = (env.SITE_URL || new URL(request.url).origin).replace(/\/$/, '')

  let payload
  try { payload = await request.json() } catch { return json({ error: 'bad_json' }, 400) }
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
