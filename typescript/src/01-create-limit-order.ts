import { setApiKey, setHost } from './api/axios.ts'
import { getFees } from './api/fees.ts'
import { getMarket } from './api/markets.ts'
import { placeOrder } from './api/order.ts'
import { getStarknetDomain } from './api/starknet.ts'
import { config } from './config.ts'
import { Order } from './models/order.ts'
import { createOrderContext } from './utils/create-order-context.ts'
import { Decimal } from './utils/number.ts'
import { roundToMinChange } from './utils/round-to-min-change.ts'
import { initWasm } from './utils/wasm.ts'

const MARKET_NAME = 'ETH-USD'

const runExample = async () => {
  await initWasm()

  setHost(config.host)
  setApiKey(config.apiKey)

  const market = await getMarket(MARKET_NAME)
  const fees = await getFees(MARKET_NAME)
  const starknetDomain = await getStarknetDomain()

  const orderSize = market.tradingConfig.minOrderSize
  const orderPrice = market.marketStats.bidPrice.times(0.9)

  const ctx = createOrderContext({
    market,
    fees,
    starknetDomain,
    vaultId: config.vaultId,
    starkPrivateKey: config.starkPrivateKey,
  })
  const order = Order.create({
    marketName: MARKET_NAME,
    orderType: 'LIMIT',
    side: 'BUY',
    amountOfSynthetic: roundToMinChange(
      orderSize,
      market.tradingConfig.minOrderSizeChange,
      Decimal.ROUND_DOWN,
    ),
    price: roundToMinChange(
      orderPrice,
      market.tradingConfig.minPriceChange,
      Decimal.ROUND_DOWN,
    ),
    timeInForce: 'GTT',
    reduceOnly: false,
    postOnly: true,
    ctx,
  })

  const result = await placeOrder({ order })

  console.log('Order placed: %o', result)
}

await runExample()
