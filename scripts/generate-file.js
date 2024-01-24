import { execSync } from 'child_process'
import { writeFileSync } from 'node:fs'

export const triggerGenerateFile = async () => {
  execSync('touch ./service_account.json')

  const content = JSON.stringify({
    type: 'service_account',
    project_id: process.env.NUXT_FIREBASE_PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY,
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT,
    client_x509_cert_url: process.env.CLIENT_CERT,
    universe_domain: 'googleapis.com',
  })

  writeFileSync('./service_account.json', content);
}

triggerGenerateFile()