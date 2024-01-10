import { init, close, calculateSignature } from './signature';

(async () => {
  try {
    await init()
    const uriPath = '/c/v0/user/login'
    const token = ''
    const language = 'en'
    const timestamp = 1704924640451
    const signature = await calculateSignature(uriPath, token, language, timestamp)
    console.info(' Expected: 4c615f3877ea8f890fd4eb185e8a6b88.5245784')
    console.info(`Signature: ${signature}`)
  } finally {
    await close()
  }
})().catch(e => { console.error(e) })
