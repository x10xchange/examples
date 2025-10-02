import { afterAll, beforeAll, expect, test, vi } from 'vitest'

import * as generateNonceModule from '../utils/generate-nonce.ts'
import { Decimal, Long } from '../utils/number.ts'
import { Order } from './order.ts'
import { type OrderContext } from './order.types.ts'

const CTX: OrderContext = {
  assetIdCollateral: Decimal(
    '1508159369509269042908118660797226224713309535454600628063900735297932481180',
  ),
  assetIdSynthetic: Decimal('344400637343183300222065759427231744'),
  settlementResolutionCollateral: Decimal('1000000'),
  settlementResolutionSynthetic: Decimal('10000000000'),
  minOrderSizeChange: Decimal('0.0001'),
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

test('creates `LIMIT / SELL` order correctly', () => {
  // given
  vi.spyOn(generateNonceModule, 'generateNonce').mockReturnValue(1473459052)

  const order = Order.create({
    marketName: 'BTC-USD',
    orderType: 'LIMIT',
    side: 'SELL',
    amountOfSynthetic: Decimal('0.001'),
    price: Decimal('43445.11680000'),
    timeInForce: 'GTT',
    expiryTime: undefined,
    reduceOnly: false,
    postOnly: false,
    tpSlType: 'ORDER',
    takeProfit: {
      triggerPrice: Decimal('49000'),
      triggerPriceType: 'MARK',
      price: Decimal('50000'),
      priceType: 'LIMIT',
    },
    stopLoss: {
      triggerPrice: Decimal('40000'),
      triggerPriceType: 'MARK',
      price: Decimal('39000'),
      priceType: 'LIMIT',
    },
    ctx: CTX,
  })

  // when / then
  expect(order.toJSON()).toMatchInlineSnapshot(`
    {
      "debuggingAmounts": {
        "collateralAmount": "43445116",
        "feeAmount": "8690",
        "syntheticAmount": "10000000",
      },
      "expiryEpochMillis": 1704420536860,
      "fee": "0.0002",
      "id": "2383967786097470112596663671073451242363987635819842372002434200436463917248",
      "market": "BTC-USD",
      "nonce": "1473459052",
      "postOnly": false,
      "price": "43445.1168",
      "qty": "0.001",
      "reduceOnly": false,
      "settlement": {
        "collateralPosition": "10002",
        "signature": {
          "r": "0x56b2fb685cc7feab021b54bc6a78521d76fb192faf6b12baa14ca1427b1b364",
          "s": "0x282fbd86bbe48e02bffe3689a50985965287044937035dc7918f7dc9f0a6e74",
        },
        "starkKey": "0x2b8ee0cf95a353cb59fdae9afb54851769e750326e24cee9621ce33f08c02ed",
      },
      "side": "SELL",
      "stopLoss": {
        "debuggingAmounts": {
          "collateralAmount": "39000000",
          "feeAmount": "7800",
          "syntheticAmount": "10000000",
        },
        "price": "39000",
        "priceType": "LIMIT",
        "settlement": {
          "collateralPosition": "10002",
          "signature": {
            "r": "0xb7603795727782806eaeddf0dbe1785346615e210bbf0316e78c556a10180a",
            "s": "0x21d804a1e44f98813354d493eb3c0990d562c536a6ac44bfbff3bc1870035c6",
          },
          "starkKey": "0x2b8ee0cf95a353cb59fdae9afb54851769e750326e24cee9621ce33f08c02ed",
        },
        "triggerPrice": "40000",
        "triggerPriceType": "MARK",
      },
      "takeProfit": {
        "debuggingAmounts": {
          "collateralAmount": "50000000",
          "feeAmount": "10000",
          "syntheticAmount": "10000000",
        },
        "price": "50000",
        "priceType": "LIMIT",
        "settlement": {
          "collateralPosition": "10002",
          "signature": {
            "r": "0x537060ce048e033ff2bc686c408c37296c134782140c287c14ad4ec8ca20e66",
            "s": "0x3621e7f65eb14492d0343d3c40127bee870901a51ba4f12ce264d392da42f28",
          },
          "starkKey": "0x2b8ee0cf95a353cb59fdae9afb54851769e750326e24cee9621ce33f08c02ed",
        },
        "triggerPrice": "49000",
        "triggerPriceType": "MARK",
      },
      "timeInForce": "GTT",
      "tpSlType": "ORDER",
      "type": "LIMIT",
    }
  `)
})
