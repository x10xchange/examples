import { setApiKey, setHost } from './api/axios.ts'
import { getFees } from './api/fees.ts'
import { getMarket } from './api/markets.ts'
import { placeOrder } from './api/order.ts'
import { getStarknetDomain } from './api/starknet.ts'
import { config } from './config.ts'
import { Order } from './models/order.ts'
import { createOrderContext } from './utils/create-order-context.js'
import { Decimal } from './utils/number.ts'
import { roundToMinChange } from './utils/round-to-min-change.ts'
import { initWasm } from './utils/wasm.ts'

const MARKET_NAME = 'ETH-USD'
const SLIPPAGE = 0.0075

const runExample = async () => {
  await initWasm()

  setHost(config.host)
  setApiKey(config.apiKey)

  const market = await getMarket(MARKET_NAME)
  const fees = await getFees(MARKET_NAME)
  const starknetDomain = await getStarknetDomain()

  const orderSize = market.tradingConfig.minOrderSize
  const orderPrice = market.marketStats.askPrice.times(1 + SLIPPAGE)

  const ctx = createOrderContext({
    market,
    fees,
    starknetDomain,
    vaultId: config.vaultId,
    starkPrivateKey: config.starkPrivateKey,
  })
  const order = Order.create({
    marketName: MARKET_NAME,
    orderType: 'MARKET',
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
    timeInForce: 'IOC',
    reduceOnly: false,
    postOnly: false,
    ctx,
  })

  const result = await placeOrder({ order })

  console.log('Order placed: %o', result)
}

await runExample()
