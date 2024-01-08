(async () => {
  var tempRet0 = 0;
  const env = {
    memoryBase: 0,
    tableBase: 0,
    emscripten_memcpy_big: function (dest, src, num) {
        print('ruh roh 1')
    },
    emscripten_resize_heap: function (num) {
        print('ruh roh 2')
    },
    setTempRet0: function (v) {
        print('ruh roh 3')
      tempRet0 = v;
    },
    memory: new WebAssembly.Memory({
      initial: 256,
    }),
    table: new WebAssembly.Table({
      initial: 0,
      element: "anyfunc",
    }),
  };
  function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18), 
                      0x80 | ((charcode>>12) & 0x3f), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}
  const fs = require("node:fs");

  const wasmBuffer = fs.readFileSync("./signature.wasm");
  const wasmModule = await WebAssembly.instantiate(wasmBuffer, { env: env });

  const { begin_signature } = wasmModule.instance.exports;
  console.log(toUTF8Array("/c/v0/errors/message"));
  const sum = begin_signature(toUTF8Array("/c/v0/errors/message"), 5, 3, 4);
  //const sum = begin_signature("/c/v0/errors/message", "", "en", 1704691178454 + "");
  console.log(sum); // Outputs: 11

  const sig = require("./signature.js");
  var o = sig.cwrap("begin_signature", "string", [
      "string",
      "string",
      "string",
      "string",
    ]),
    s = sig.cwrap("end_signature", "number", ["string"]),
    l = o("/c/v0/errors/message", "", "en", 1704691178454 + "");
  const m = sig._begin_signature("1", "2", "3", "4");
  print(m);
})();
