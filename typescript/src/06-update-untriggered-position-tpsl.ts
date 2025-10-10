import { getFees } from './api/fees.ts'
import { getMarket } from './api/markets.ts'
import { placeOrder } from './api/order.ts'
import { getOrders } from './api/orders.ts'
import { getStarknetDomain } from './api/starknet.ts'
import { init } from './init.ts'
import { Order } from './models/order.ts'
import { createOrderContext } from './utils/create-order-context.ts'
import { invariant } from './utils/invariant.ts'
import { Decimal } from './utils/number.ts'
import { roundToMinChange } from './utils/round-to-min-change.ts'

const MARKET_NAME = 'ETH-USD' // position market - replace with needed position market
const ORDER_ID = '1976663382825091072' // replace with your order id

const runExample = async () => {
  const { starkPrivateKey, vaultId } = await init()

  const market = await getMarket(MARKET_NAME)
  const fees = await getFees(MARKET_NAME)
  const starknetDomain = await getStarknetDomain()

  const orders = await getOrders({
    marketsNames: [MARKET_NAME],
  })

  const roundPrice = (value: Decimal) => {
    return roundToMinChange(
      value,
      market.tradingConfig.minPriceChange,
      Decimal.ROUND_DOWN,
    )
  }

  const tpSlOrder = orders.find(
    (order) => order.type === 'TPSL' && Boolean(order.tpSlType) && order.id.eq(ORDER_ID),
  )

  invariant(tpSlOrder, 'TPSL order not found for given market')

  const bidPrice = market.marketStats.bidPrice
  const tpTriggerPrice = bidPrice.times(1.01)
  const tpPrice = bidPrice.times(1.015)
  const slTriggerPrice = bidPrice.times(0.99)
  const slPrice = bidPrice.times(0.985)

  const ctx = createOrderContext({
    market,
    fees,
    starknetDomain,
    vaultId,
    starkPrivateKey,
  })

  // Assuming you have LONG ETH-USD position with a size >= `minOrderSize`
  const order = Order.create({
    marketName: MARKET_NAME,
    orderType: 'TPSL',
    side: tpSlOrder.side,
    amountOfSynthetic: Decimal(0), // Ignored for position TP/SL
    price: Decimal(0), // Ignored for TPSL orders
    timeInForce: 'GTT',
    reduceOnly: true,
    postOnly: false,
    tpSlType: 'POSITION',
    takeProfit: {
      triggerPrice: roundPrice(tpTriggerPrice),
      triggerPriceType: 'LAST',
      price: roundPrice(tpPrice),
      priceType: 'LIMIT',
    },
    stopLoss: {
      triggerPrice: roundPrice(slTriggerPrice),
      triggerPriceType: 'LAST',
      price: roundPrice(slPrice),
      priceType: 'LIMIT',
    },
    cancelId: tpSlOrder.externalId,
    ctx,
  })

  const result = await placeOrder({ order })

  console.log('Order updated: %o', result)
}

await runExample()
