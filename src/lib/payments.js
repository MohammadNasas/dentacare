// Client helpers for the MyFatoorah payment flow (talks to Netlify Functions).
import { isCloud } from './supabaseClient'

// Real payments only run in cloud mode (the serverless functions live on Netlify).
export const paymentsEnabled = isCloud

export async function startCheckout({ tier, clinicId, customerName, email, phone }) {
  try {
    const r = await fetch('/.netlify/functions/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, clinicId, customerName, email, phone }),
    })
    const data = await r.json().catch(() => ({}))
    if (r.ok && data.url) return { ok: true, url: data.url }
    return { ok: false, error: data.error || 'failed', message: data.message, status: r.status }
  } catch (e) {
    return { ok: false, error: 'network', message: String(e) }
  }
}

export async function verifyPayment(paymentId) {
  try {
    const r = await fetch('/.netlify/functions/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId }),
    })
    return await r.json()
  } catch (e) {
    return { ok: false, error: 'network', message: String(e) }
  }
}

// MyFatoorah returns to  …/?payment=return&paymentId=XXX
export function getPaymentReturn() {
  const p = new URLSearchParams(window.location.search)
  if (p.get('payment') === 'return' && p.get('paymentId')) return p.get('paymentId')
  if (p.get('payment') === 'error') return 'error'
  return null
}
export function clearPaymentReturn() {
  const url = new URL(window.location.href)
  url.search = ''
  window.history.replaceState({}, '', url.toString())
}
