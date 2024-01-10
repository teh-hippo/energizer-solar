
import { Person } from './person';
import { get } from 'https';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { join } from 'path';

async function downloadTemp(url: string, fileName: string): Promise<void> {
    const tempFolder: string = "temp";
    if (!existsSync(tempFolder)) {
        mkdirSync(tempFolder);
    }
    const destFileName = join(tempFolder, fileName);
    await new Promise<void>((resolve,reject) => {
        const request = get(url, response => {
            const stream = createWriteStream(destFileName);
            response.pipe(stream);
            stream.on("finish", () => {
                stream.close();
            })
            .on("close", () => {
                resolve();
            })
            .on("error", e => {
                console.error(e);
                reject(e.message);
            });
        }).on("error", e => {
            console.error(e);
            reject(e.message);
        });
                
    });
}

(async() => {
    let person = new Person('Bob', 34);
    console.log(person.getGreeting());
    await downloadTemp("https://www.google.com", "index.html");
    console.log("done");
})();
