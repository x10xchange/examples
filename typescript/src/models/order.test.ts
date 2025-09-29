import { afterAll, beforeAll, expect, test, vi } from 'vitest'

import * as generateNonceModule from '../utils/generate-nonce.ts'
import { Decimal, Long } from '../utils/number.ts'
import { Order } from './order.ts'
import { type OrderContext } from './types.ts'

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
      "expiryEpochMillis": 1712192936860,
      "fee": "0.0002",
      "id": "887609576971188750285981806834787874541901297269844521933450115307657382405",
      "market": "BTC-USD",
      "nonce": "1473459052",
      "postOnly": false,
      "price": "43445.1168",
      "qty": "0.001",
      "reduceOnly": false,
      "settlement": {
        "collateralPosition": "10002",
        "signature": {
          "r": "0x3456be79ae552946ff1aac0ca3bc54ef7adab9bfc59808fdf9c8468ea0e3067",
          "s": "0x31a677280ad51b3f78c3b75ab3f002da4dd48a6802c8251e9795cda51e504c2",
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
            "r": "0x71b17ceae23dc1c6937ee79dd4ec7caf551a43b095eb11277201d8ca314f9c9",
            "s": "0x74d7259cc58b8e7c95e6339d6c90081f0ef548954106db32100e929139b589f",
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
            "r": "0xc7bcfbcb9a37159379f278b1612cf6cb7fa23899a01ac70dbc8dc15c2dd564",
            "s": "0x1509082ab7b37f4f0d862b5f2a0c1f12bda8b691808008d5deb08bfa201a815",
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
