import { get_order_msg as wasmLibGetOrderMsgHash } from '@x10xchange/stark-crypto-wrapper-wasm'
import {
  hash as starkHash,
  selector as starkSelector,
  shortString as starkShortString,
} from 'starknet'

import { type StarknetDomain } from '../../api/starknet.schema.ts'
import { type OrderSide } from '../../models/types.ts'
import { fromHexString, toHexString, type HexString } from '../hex.ts'
import { type Decimal, type Long } from '../number.ts'
import { calcStarknetExpiration } from './calc-starknet-expiration.ts'

const jsGetStarknetDomainObjHash = (domain: StarknetDomain) => {
  const selector = starkSelector.getSelector(
    '"StarknetDomain"("name":"shortstring","version":"shortstring","chainId":"shortstring","revision":"shortstring")',
  )

  return starkHash.computePoseidonHashOnElements([
    selector,
    starkShortString.encodeShortString(domain.name),
    starkShortString.encodeShortString(domain.version),
    starkShortString.encodeShortString(domain.chainId),
    domain.revision,
  ])
}

const jsGetObjMsgHash = (domainHash: string, publicKey: string, objHash: string) => {
  const messageFelt = starkShortString.encodeShortString('StarkNet Message')

  return starkHash.computePoseidonHashOnElements([
    messageFelt,
    domainHash,
    publicKey,
    objHash,
  ])
}

const jsGetOrderMsgHash = (...args: Parameters<typeof wasmLibGetOrderMsgHash>) => {
  const [
    positionId,
    baseAssetIdHex,
    baseAmount,
    quoteAssetIdHex,
    quoteAmount,
    feeAssetIdHex,
    feeAmount,
    expiration,
    salt,
    userPublicKeyHex,
    domainName,
    domainVersion,
    domainChainId,
    domainRevision,
  ] = args

  const domainHash = jsGetStarknetDomainObjHash({
    name: domainName,
    version: domainVersion,
    chainId: domainChainId,
    revision: parseInt(domainRevision),
  })

  const orderSelector = starkSelector.getSelector(
    '"Order"("position_id":"felt","base_asset_id":"AssetId","base_amount":"i64","quote_asset_id":"AssetId","quote_amount":"i64","fee_asset_id":"AssetId","fee_amount":"u64","expiration":"Timestamp","salt":"felt")"PositionId"("value":"u32")"AssetId"("value":"felt")"Timestamp"("seconds":"u64")',
  )
  const orderHash = starkHash.computePoseidonHashOnElements([
    orderSelector,
    positionId,
    baseAssetIdHex,
    baseAmount,
    quoteAssetIdHex,
    quoteAmount,
    feeAssetIdHex,
    feeAmount,
    expiration,
    salt,
  ])

  return jsGetObjMsgHash(domainHash, userPublicKeyHex, orderHash)
}

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

export const getStarknetOrderMsgHash = (args: GetStarknetOrderMsgHashArgs) => {
  const isBuyingSynthetic = args.side === 'BUY'
  const expirationTimestamp = calcStarknetExpiration(args.expiryEpochMillis)

  const [amountCollateral, amountSynthetic] = isBuyingSynthetic
    ? [args.collateralAmountStark.negated(), args.syntheticAmountStark]
    : [args.collateralAmountStark, args.syntheticAmountStark.negated()]

  const getOrderHashArgs = [
    /* position_id         */ args.vaultId.toString(),
    /* base_asset_id_hex   */ toHexString(args.assetIdSynthetic.toString(16)),
    /* base_amount         */ amountSynthetic.toString(10),
    /* quote_asset_id_hex  */ toHexString(args.assetIdCollateral.toString(16)),
    /* quote_amount        */ amountCollateral.toString(10),
    /* fee_asset_id_hex    */ toHexString(args.assetIdCollateral.toString(16)),
    /* fee_amount          */ args.feeStark.toString(10),
    /* expiration          */ expirationTimestamp.toString(10),
    /* salt                */ args.nonce.toString(10),
    /* user_public_key_hex */ args.starkPublicKey,
    /* domain_name         */ args.starknetDomain.name,
    /* domain_version      */ args.starknetDomain.version,
    /* domain_chain_id     */ args.starknetDomain.chainId,
    /* domain_revision     */ args.starknetDomain.revision.toString(),
  ] as const

  try {
    const wasmHash = wasmLibGetOrderMsgHash(...getOrderHashArgs)

    return fromHexString(wasmHash as HexString)
  } catch {
    const jsHash = jsGetOrderMsgHash(...getOrderHashArgs)

    return fromHexString(jsHash as HexString)
  }
}
