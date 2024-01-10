import { init, close } from './signature';

(async () => {
  await init().finally(close)
})().catch(e => { console.error(e) })
