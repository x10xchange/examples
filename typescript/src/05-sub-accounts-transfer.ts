import { getAccounts } from './api/account-info.ts'
import { getAssets } from './api/assets.ts'
import { getStarknetDomain } from './api/starknet.ts'
import { transfer } from './api/transfer.ts'
import { init } from './init.ts'
import { Transfer } from './models/transfer.ts'
import type { TransferContext } from './models/transfer.types.ts'
import { checkRequired } from './utils/check-required.ts'
import { invariant } from './utils/invariant.ts'
import { Decimal } from './utils/number.ts'

const runExample = async () => {
  const { starkPrivateKey } = await init()

  const assets = await getAssets({ assetsNames: ['USD'], isCollateral: true })
  const accounts = await getAccounts()
  const starknetDomain = await getStarknetDomain()

  const amount = Decimal(1)
  const usdAsset = checkRequired(assets[0], 'USD asset')

  invariant(accounts.length > 1, 'Should be at least 2 accounts to run this example')

  const ctx: TransferContext = {
    accounts,
    collateralId: usdAsset.starkexId,
    collateralResolution: usdAsset.starkexResolution,
    starkPrivateKey,
    starknetDomain,
  }
  const transferObject = Transfer.create({
    fromAccountId: accounts[0].accountId,
    toAccountId: accounts[1].accountId,
    amount,
    transferredAsset: 'USD',
    ctx,
  })

  const result = await transfer(transferObject)

  console.log('Transfer: %o', result)
}

await runExample()
