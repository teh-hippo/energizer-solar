import { get } from 'https'
import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'
import puppeteer from 'puppeteer'

const tempFolder: string = 'temp'
const signatureFile: string = 'embedded-signature.htm'

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
  const fileName = copySignature()
  const fileUri = url.pathToFileURL(fileName)
  console.debug(`wrote to: ${fileUri.toString()}`)
  await startPuppeteer(fileUri)
}

async function startPuppeteer (uri: URL): Promise<void> {
  const browser = await puppeteer.launch({
    headless: false
    // args: ['--no-sandbox']
  })
  const page = await browser.newPage()
  await page.bringToFront()
  await page.goto(uri.toString())
  await page.waitForNetworkIdle()
  const uriPath = '/api/login'
  const token = ''
  const language = 'en'
  const timestamp = '12341283497'
  console.info(`Calculating signature: ${uriPath}, ${token}, ${language}, ${timestamp}`)
  const result2 = await page.evaluate('1 + 2')
  console.info(`Result2: ${result2 as number}`)
  const result = await page.evaluate(`
    var stackSave = Module.cwrap("stackSave", "string", null);
    var sign = Module.cwrap("begin_signature", "string", ["string", "string", "string", "string"]);
    sign("${uriPath}", "${token}", "${language}", "${timestamp}");`)
  console.info(`Signature result: ${result as string}`)
  await page.close()
  await browser.close()
}

function copySignature (): string {
  const destFileName = path.join(tempFolder, signatureFile)
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
  return destFileName
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
    get(url, (response) => {
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

export { init }
