import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as path from 'path';

// Your existing admin@bidforge.com account UID
const ADMIN_UID = 'sWVElZyi2EfWq3WjhDiVZ81QahQ2';

const app = initializeApp({
  credential: cert(path.resolve(__dirname, '../serviceAccountKey.json')),
});

async function main() {
  await getAuth(app).setCustomUserClaims(ADMIN_UID, { role: 'admin' });
  console.log(`✅ Custom claim { role: 'admin' } set on UID: ${ADMIN_UID}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Failed to set custom claim:', err);
  process.exit(1);
});