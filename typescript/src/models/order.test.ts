import { afterAll, beforeAll, expect, test, vi } from 'vitest'

import * as generateNonceModule from '../utils/generate-nonce.ts'
import { Decimal, Long } from '../utils/number.ts'
import { Order } from './order.ts'
import { OrderContext } from './types.ts'

const CTX: OrderContext = {
  assetIdCollateral: Decimal(
    '1508159369509269042908118660797226224713309535454600628063900735297932481180',
  ),
  assetIdSynthetic: Decimal('344400637343183300222065759427231744'),
  settlementResolutionCollateral: Decimal('1000000'),
  settlementResolutionSynthetic: Decimal('10000000000'),
  minOrderSizeChange: Decimal('0.0001'),
  maxPositionValue: Decimal('10000000'),
  feeRate: Decimal('2').div(Decimal('10000')),
  vaultId: Long(10002),
  starkPrivateKey: '0x659127796b268530385f753efee81112c628b2bf266e025d3b52d16204c5504',
  starknetDomain: {
    name: 'Perpetuals',
    version: 'v0',
    chainId: 'SN_SEPOLIA',
    revision: 1,
  },
}

beforeAll(() => {
  vi.useFakeTimers({
    now: Date.parse('2024-01-05 01:08:56.860694'),
  })
})

afterAll(() => {
  vi.useRealTimers()
})

test('creates `LIMIT / BUY` order correctly', () => {
  // given
  vi.spyOn(generateNonceModule, 'generateNonce').mockReturnValue(1473459052)

  const order = Order.create({
    marketName: 'BTC-USD',
    orderType: 'LIMIT',
    side: 'BUY',
    amountOfSynthetic: Decimal('0.001'),
    price: Decimal('43445.1168'),
    timeInForce: 'GTT',
    expiryTime: undefined,
    reduceOnly: false,
    postOnly: false,
    ctx: CTX,
  })

  // when / then
  expect(order.toJSON()).toMatchInlineSnapshot(`
    {
      "debuggingAmounts": {
        "collateralAmount": "43445117",
        "feeAmount": "8690",
        "syntheticAmount": "10000000",
      },
      "expiryEpochMillis": 1712192936860,
      "fee": "0.0002",
      "id": "119182652942028501981508889931571960493412447256454049664487964380256611929",
      "market": "BTC-USD",
      "nonce": "1473459052",
      "postOnly": false,
      "price": "43445.1168",
      "qty": "0.001",
      "reduceOnly": false,
      "settlement": {
        "collateralPosition": "10002",
        "signature": {
          "r": "0x3ba56549ade7c0ca7a95d7378b65392dfc456deaba4664ee8a35ed068b47855",
          "s": "0x188d68626cbe9262cfe20f2537c4b66994868ccf2271aeef4b3a51ab613afbb",
        },
        "starkKey": "0x2b8ee0cf95a353cb59fdae9afb54851769e750326e24cee9621ce33f08c02ed",
      },
      "side": "BUY",
      "timeInForce": "GTT",
      "type": "LIMIT",
    }
  `)
})
