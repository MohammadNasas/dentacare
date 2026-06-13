import { useState } from 'react'
import Landing from './Landing'
import Login from './Login'
import { isElectron } from '../lib/downloads'

// Public (logged-out) experience.
// • Website  → marketing landing page first, then the sign-in / registration form.
// • Desktop app (Electron) → straight to the sign-in form (no marketing page).
export default function PublicEntry() {
  const [auth, setAuth] = useState(isElectron ? 'signin' : null) // null = landing; 'signin' | 'register' = form

  // In the desktop app there is no landing page to go back to.
  if (isElectron) return <Login initialTab={auth || 'signin'} />

  if (auth) return <Login initialTab={auth} onBack={() => setAuth(null)} />
  return <Landing onEnter={(tab) => setAuth(tab || 'signin')} />
}
