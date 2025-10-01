import { sign_message as wasmSignMessage } from '@x10xchange/stark-crypto-wrapper-wasm'

import { getStarkPublicKey } from './get-stark-public-key.ts'
import { fromHexString, type HexString } from './hex.ts'

export const signMessage = (messageHash: string, starkPrivateKey: HexString) => {
  const starkPublicKey = getStarkPublicKey(starkPrivateKey)

  const wasmSignature = wasmSignMessage(starkPrivateKey, messageHash)
  const wasmResult = {
    signature: {
      r: fromHexString(wasmSignature.r as HexString),
      s: fromHexString(wasmSignature.s as HexString),
    },
    starkKey: starkPublicKey,
  }
  // See this thread for the reason why we need to free the memory:
  // https://stackoverflow.com/questions/73655844/when-should-i-call-the-free-methods-generated-by-wasm-pack
  wasmSignature.free()

  return wasmResult
}
