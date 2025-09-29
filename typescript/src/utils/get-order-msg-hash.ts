import { get_order_msg as wasmGetOrderMsgHash } from '@x10xchange/stark-crypto-wrapper-wasm'

import { type StarknetDomain } from '../api/starknet.schema.ts'
import { type OrderSide } from '../models/types.ts'
import { calcStarknetExpiration } from './calc-starknet-expiration.ts'
import { fromHexString, toHexString, type HexString } from './hex.ts'
import { type Decimal, type Long } from './number.ts'

type GetStarknetOrderMsgHashArgs = {
  side: OrderSide
  nonce: Long
  assetIdCollateral: Decimal
  assetIdSynthetic: Decimal
  collateralAmountStark: Long
  feeStark: Long
  syntheticAmountStark: Long
  expiryEpochMillis: number
  vaultId: Long
  starkPublicKey: HexString
  starknetDomain: StarknetDomain
}

export const getStarknetOrderMsgHash = ({
  side,
  nonce,
  assetIdCollateral,
  assetIdSynthetic,
  collateralAmountStark,
  feeStark,
  syntheticAmountStark,
  expiryEpochMillis,
  vaultId,
  starkPublicKey,
  starknetDomain,
}: GetStarknetOrderMsgHashArgs) => {
  const isBuyingSynthetic = side === 'BUY'
  const expirationTimestamp = calcStarknetExpiration(expiryEpochMillis)

  const [amountCollateral, amountSynthetic] = isBuyingSynthetic
    ? [collateralAmountStark.negated(), syntheticAmountStark]
    : [collateralAmountStark, syntheticAmountStark.negated()]

  const getOrderHashArgs = [
    /* position_id         */ vaultId.toString(),
    /* base_asset_id_hex   */ toHexString(assetIdSynthetic.toString(16)),
    /* base_amount         */ amountSynthetic.toString(10),
    /* quote_asset_id_hex  */ toHexString(assetIdCollateral.toString(16)),
    /* quote_amount        */ amountCollateral.toString(10),
    /* fee_asset_id_hex    */ toHexString(assetIdCollateral.toString(16)),
    /* fee_amount          */ feeStark.toString(10),
    /* expiration          */ expirationTimestamp.toString(10),
    /* salt                */ nonce.toString(10),
    /* user_public_key_hex */ starkPublicKey,
    /* domain_name         */ starknetDomain.name,
    /* domain_version      */ starknetDomain.version,
    /* domain_chain_id     */ starknetDomain.chainId,
    /* domain_revision     */ starknetDomain.revision.toString(),
  ] as const

  const wasmHash = wasmGetOrderMsgHash(...getOrderHashArgs)

  return fromHexString(wasmHash as HexString)
}
