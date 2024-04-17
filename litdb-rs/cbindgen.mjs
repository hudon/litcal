#!/usr/bin/env zx
const crate = "litdb"
const out = "my_header.h"
const cfg = "cbindgen.toml"
await $`cbindgen --config ${cfg} --crate ${crate} --output ${out}`
console.log(`
Done generating C header in '${out}'.
`)