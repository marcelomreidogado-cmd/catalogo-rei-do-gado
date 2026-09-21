/** Owner-only recovery. Run with Application Default Credentials for the project owner.
 * Do not upload account keys. The new password is read from RDG_NEW_PASSWORD,
 * never written to the repository or printed. Normal changes use the app UI.
 */
import { initializeApp, applicationDefault, deleteApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { CONFIG } from '../js/config.js';
const email = process.argv[2] || CONFIG.adminEmail;
const password = process.env.RDG_NEW_PASSWORD;
if (!email || !password || password.length < 10) {
  throw new Error('Informe o e-mail interno como argumento e RDG_NEW_PASSWORD (mínimo 10 caracteres).');
}
const app = initializeApp({ projectId: CONFIG.firebase.projectId, credential: applicationDefault() });
try {
  const auth = getAuth(app);
  const user = await auth.getUserByEmail(email);
  if (email !== CONFIG.adminEmail || user.customClaims?.catalogAdmin !== true) throw new Error('A conta não é administradora da loja.');
  await auth.updateUser(user.uid, { password });
  await auth.revokeRefreshTokens(user.uid);
  console.log('Senha redefinida e sessões anteriores revogadas.');
} finally { await deleteApp(app); }
