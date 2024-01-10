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
  // TODO: Cache & avoid downloading again.
  await downloadTemp(
    'https://portal.energizersolar.com/js/signature.js',
    'signature.js'
  )
  await downloadTemp(
    'https://portal.energizersolar.com/js/signature.wasm',
    'signature.wasm'
  )
  createSignature()
  const port = startServer()
  await startPuppeteer(port)
}

async function startPuppeteer (port: number): Promise<void> {
  const address = `http://127.0.0.1:${port}`
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  })
  page = await browser.newPage()
  await page.bringToFront()
  await page.goto(address)
  await page.waitForNetworkIdle()
}

async function calculateSignature (uriPath: string, token: string, language: string, timestamp: number): Promise<string> {
  if (page === undefined) throw new Error('Uninitialised')
  console.info(`Calculating signature: ${uriPath}, ${token}, ${language}, ${timestamp}`)
  const result = await page.evaluate(`
    var sign = Module.cwrap("begin_signature", "string", ["string", "string", "string", "string"]);
    sign("${uriPath}", "${token}", "${language}", "${timestamp}");`)
  return result as string
}

function createSignature (): void {
  const destFileName = path.join(tempFolder, 'index.htm')
  if (fs.existsSync(destFileName)) {
    fs.rmSync(destFileName)
  }
  const stream = fs.createWriteStream(destFileName)
  stream.write(`<!DOCTYPE html><!-- Credits to Roses.SolarAPI -->
  <html lang=en>
      <head>
          <meta charset=utf-8>
          <meta http-equiv=pragram content=no-cache>
          <meta http-equiv=cache-control content="no-cache, no-store, must-revalidate">
          <script src="signature.js"></script>
    </head>
    <body>
      <script>
          console.log("Loaded script");
      </script></body>
  </html>`)
  stream.close()
}

function startServer (): number {
  const serve = serveStatic(tempFolder, { index: ['index.htm'] })
  server = http.createServer(function onRequest (req, res) {
    serve(req, res, finalhandler(req, res))
  })
  const addr = server.listen(0).address()
  const port = (addr as AddressInfo)?.port
  if (port === undefined) throw new Error('Unable to get a port')
  return port
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
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder)
  }
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
