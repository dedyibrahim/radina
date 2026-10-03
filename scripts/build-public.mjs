import { cp, readdir } from 'node:fs/promises'
import path from 'node:path'
// Serve static files from Laravel's document root; Laravel renders index metadata.
for (const entry of await readdir('frontend/dist', { withFileTypes: true })) {
  if (entry.name === 'index.html') continue
  await cp(path.join('frontend/dist', entry.name), path.join('public', entry.name), { recursive: true })
}
