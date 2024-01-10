import { init, close, calculateSignature } from './signature';

(async () => {
  try {
    await init()
    const uriPath = '/api/login'
    const token = ''
    const language = 'en'
    const timestamp = 12341283497
    const signature = await calculateSignature(uriPath, token, language, timestamp)
    console.info(`Signature: ${signature}`)
  } finally {
    await close()
  }
})().catch(e => { console.error(e) })
