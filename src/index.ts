
import { downloadTemp } from './download';

(async() => {
    // TODO: Cache & avoid downloading again.
    await downloadTemp("https://portal.energizersolar.com/js/signature.js", "signature.js");
    await downloadTemp("https://portal.energizersolar.com/js/signature.wasm", "signature.wasm");
})();
