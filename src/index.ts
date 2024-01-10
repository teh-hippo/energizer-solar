import { init } from './signature';

(async () => {
  await init()
})().catch(e => { console.error(e) })
