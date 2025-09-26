import { readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import wasmStarkInit from '@x10xchange/stark-crypto-wrapper-wasm'

export const initWasm = async () => {
  const wasmDir = dirname(
    fileURLToPath(import.meta.resolve('@x10xchange/stark-crypto-wrapper-wasm')),
  )
  const wasmBuffer = readFileSync(`${wasmDir}/stark_crypto_wrapper_wasm_bg.wasm`)
  await wasmStarkInit({ module_or_path: wasmBuffer })
}
