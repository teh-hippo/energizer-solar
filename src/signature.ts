import { get } from "https";
import * as fs from "fs";
import * as path from "path";

export { init };

const tempFolder: string = "temp";
const signatureFile: string = "embedded-signature.htm";

async function init() {
  // TODO: Cache & avoid downloading again.
  await downloadTemp(
    "https://portal.energizersolar.com/js/signature.js",
    "signature.js"
  );
  await downloadTemp(
    "https://portal.energizersolar.com/js/signature.wasm",
    "signature.wasm"
  );
  await copySignature();
}

async function copySignature(): Promise<void> {
  const destFileName = path.join(tempFolder, signatureFile);
  const stream = fs.createWriteStream(destFileName);
  await new Promise<void>((resolve, reject) => {
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
  </html>`);

    stream
      .on("finish", () => stream.close())
      .on("close", () => resolve())
      .on("error", (e) => reject(e.message));
  });
}

async function downloadTemp(
  url: string,
  fileName: string,
  force?: boolean
): Promise<void> {
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
  }
  const destFileName = path.join(tempFolder, fileName);
  if (fs.existsSync(destFileName) && force != true) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const _ = get(url, (response) => {
      const stream = fs.createWriteStream(destFileName);
      response.pipe(stream);
      stream
        .on("finish", () => stream.close())
        .on("close", () => resolve())
        .on("error", (e) => reject(e.message));
    }).on("error", (e) => {
      console.error(e);
      reject(e.message);
    });
  });
}
