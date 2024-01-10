import { get } from 'https'
import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'

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
  console.info(`wrote to: ${fileUri.toString()}`)
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
