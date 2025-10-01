import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import wasmStarkInit from '@x10xchange/stark-crypto-wrapper-wasm'

export const initWasm = async () => {
  const wasmDir = dirname(
    createRequire(import.meta.url).resolve('@x10xchange/stark-crypto-wrapper-wasm'),
  )
  const wasmBuffer = readFileSync(`${wasmDir}/stark_crypto_wrapper_wasm_bg.wasm`)
  await wasmStarkInit({ module_or_path: wasmBuffer })
}
