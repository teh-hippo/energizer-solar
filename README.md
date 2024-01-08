# Energizer Solar

[Energizer Solar](http://portal.energizersolar.com) provides solar readings (live and historical) for products of the same name.
The portal is a Vue.JS application, which calls into a set of back-end APIs.

Goal of this project is to provide a wrapper for the web API instead of the application.

E.g., provide solar data in a Prometheus format.

## Updates

- [OpenAPI Dev Tools](https://chrome.google.com/webstore/detail/jelghndoknklgabjgaeppjhommkkmdii) will be useful to generate the API.
- Found: [dmarjoram:Roses.SolarAPI](https://github.com/dmarjoram/Roses.SolarAPI/) through GH search.  Looks very similar & promising.



## Example

```bash
curl 'https://portal.energizersolar.com/c/v0/user/login' \
    -X POST \
    -H 'lang: en' \
    -H 'token: ' \
    -H 'timezone: Country/City' \
    -H 'timestamp: <Epoch>' \
    -H 'signature: abcd01234567890.5245784' \
    --data-raw '{"user":"<username>","password":"<sha256sum>"}'
```

Real credentials aren't required, as `getSignature()` will be called ahead of the network request for login going ahead.

## Current Problem

The API endpoints are easy to discover through a web UI, and the raw data is in an easy format.

Problem is the `signature` field, which is created using [Javascript](https://portal.energizersolar.com/js/signature.js) and [WebAssembly](https://portal.energizersolar.com/js/signature.wasm).

1. Calls `getSignature(url: '/c/v0/user/login', token: '', lang: 'en', epoch:(new Date).getTime())` in the Vue.JS app.
1. String fields are placed on a bufferred stack for use with WebAssembly (for some reason...?).
1. Wasm `_begin_signature` does some magic.
1. Closes with `_end_signature`
1. Result.

## General Ideas

- Pull & wrap around the latest [WebAssembly](https://portal.energizersolar.com/js/signature.wasm).  Allows execution from other languages.
- Reverse engineer the [WebAssembly](https://portal.energizersolar.com/js/signature.wasm).  Time consuming; invalid if the WASM is updated.
- Use [Puppeteer](https://pptr.dev/).  Not portable - stuck in Javascript land.
