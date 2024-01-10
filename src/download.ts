import { get } from "https";
import { existsSync, mkdirSync, createWriteStream } from "fs";
import { join } from "path";

export { downloadTemp };

async function downloadTemp(
  url: string,
  fileName: string,
  force?: boolean
): Promise<void> {
  const tempFolder: string = "temp";
  if (!existsSync(tempFolder)) {
    mkdirSync(tempFolder);
  }
  const destFileName = join(tempFolder, fileName);
  if (existsSync(destFileName) && force != true) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const request = get(url, (response) => {
      const stream = createWriteStream(destFileName);
      response.pipe(stream);
      stream
        .on("finish", () => {
          stream.close();
        })
        .on("close", () => {
          resolve();
        })
        .on("error", (e) => {
          console.error(e);
          reject(e.message);
        });
    }).on("error", (e) => {
      console.error(e);
      reject(e.message);
    });
  });
}
