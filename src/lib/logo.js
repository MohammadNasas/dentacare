// Bundled app logo. Imported as a module (not referenced as the public path
// "/logo.png") so Vite emits a relative asset URL that resolves correctly under
// the file:// protocol in the packaged Electron app — not only on the web.
import logo from '../assets/logo.png'

export default logo
