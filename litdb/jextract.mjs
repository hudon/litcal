#!/usr/bin/env zx
const pkg = "com.litcal.litdb.guts"
await $`jextract -l litdb -t ${pkg} src/litdb.h`
console.log(`
Done generating Java package '${pkg}'.
`)