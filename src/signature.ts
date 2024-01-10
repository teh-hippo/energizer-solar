import * as fsa from 'node:fs/promises'
import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import puppeteer from 'puppeteer'
import type { Browser, Page } from 'puppeteer'
import serveStatic from 'serve-static'
import finalhandler from 'finalhandler'
import type { AddressInfo } from 'net'

const tempFolder: string = 'temp'
let server: http.Server | undefined
let page: Page | undefined
let browser: Browser | undefined

async function init (): Promise<void> {
  await fsa.mkdir(tempFolder, { recursive: true })
  // TODO: Cache & avoid downloading again.
  await downloadTemp(
    'https://portal.energizersolar.com/js/signature.js',
    'signature.js'
  )
  await downloadTemp(
    'https://portal.energizersolar.com/js/signature.wasm',
    'signature.wasm'
  )
  const port = await startServer()
  await startPuppeteer(port)
}

async function startPuppeteer (port: number): Promise<void> {
  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  })
  page = await browser.newPage()
  await page.goto(`http://127.0.0.1:${port}`)
  await page.waitForNetworkIdle()
}

async function calculateSignature (uriPath: string, token: string, timestamp: number): Promise<string> {
  const language = 'en' // This doesn't impact API calls, so hard-code instead of overcomplicating params.
  if (page === undefined) throw new Error('Uninitialised')
  console.debug(`Calculating signature: ${uriPath}, ${token}, ${language}, ${timestamp}`)
  const result = await page.evaluate(`
    var sign = Module.cwrap("begin_signature", "string", ["string", "string", "string", "string"]);
    sign("${uriPath}", "${token}", "${language}", "${timestamp}");`)
  return result as string
}

async function startServer (): Promise<number> {
  await fsa.writeFile(path.join(tempFolder, 'index.htm'), '<html><head><script src="signature.js"></script></head></html>')
  const serve = serveStatic(tempFolder, { index: ['index.htm'] })
  server = http.createServer(function onRequest (req, res) {
    serve(req, res, finalhandler(req, res))
  })
  const addr = server.listen(0).address() as AddressInfo
  if (addr === undefined) throw new Error('Unable to get a port')
  return addr.port
}

async function close (): Promise<void> {
  server?.close()
  await page?.close()
  await browser?.close()
}

async function downloadTemp (
  url: string,
  fileName: string,
  force?: boolean
): Promise<void> {
  const destFileName = path.join(tempFolder, fileName)
  if (fs.existsSync(destFileName) && force !== true) {
    return
  }
  await new Promise<void>((resolve, reject) => {
    http.get(url, (response) => {
      const stream = fs.createWriteStream(destFileName)
      response.pipe(stream)
      stream
        .on('finish', () => {
          stream.close()
        })
        .on('close', () => {
          resolve()
        })
        .on('error', (e) => {
          reject(e.message)
        })
    }).on('error', (e) => {
      console.error(e)
      reject(e.message)
    })
  })
}

export { init, close, calculateSignature }
