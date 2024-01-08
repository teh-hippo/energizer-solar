#!/bin/bash
[ ! -d temp ] && mkdir temp
curl -o temp/signature.cjs https://portal.energizersolar.com/js/signature.js
curl -o temp/signature.wasm https://portal.energizersolar.com/js/signature.wasm