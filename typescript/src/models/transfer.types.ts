import { AccountInfo } from '../api/account-info.schema.ts'
import { StarknetDomain } from '../api/starknet.schema.ts'
import { HexString } from '../utils/hex.ts'

export type SettlementSignature = { r: string; s: string }
export type TransferContext = {
  accounts: AccountInfo[]
  collateralId: HexString
  collateralResolution: number
  starkPrivateKey: HexString
  starknetDomain: StarknetDomain
}
