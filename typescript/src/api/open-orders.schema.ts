import { z } from 'zod/v4'

import { zodLong } from '../utils/zod.ts'

const TriggerSchema = z.object({
  triggerPrice: z.string(),
  triggerPriceType: z.enum(['LAST', 'MARK', 'INDEX']),
  triggerPriceDirection: z.enum(['UP', 'DOWN']),
  executionPriceType: z.enum(['LIMIT', 'MARKET']),
})

const TakeProfitSchema = z.object({
  triggerPrice: z.string(),
  triggerPriceType: z.enum(['LAST', 'MARK', 'INDEX']),
  price: z.string(),
  priceType: z.enum(['MARKET', 'LIMIT']),
})

const StopLossSchema = z.object({
  triggerPrice: z.string(),
  triggerPriceType: z.enum(['LAST', 'MARK', 'INDEX']),
  price: z.string(),
  priceType: z.enum(['MARKET', 'LIMIT']),
})

export const OpenOrderSchema = z.object({
  id: zodLong(),
  externalId: z.string(),
  accountId: z.number(),
  market: z.string(),
  status: z.enum([
    'NEW',
    'PARTIALLY_FILLED',
    'FILLED',
    'UNTRIGGERED',
    'CANCELLED',
    'REJECTED',
    'EXPIRED',
    'TRIGGERED',
  ]),
  statusReason: z
    .enum([
      'NONE',
      'UNKNOWN',
      'UNKNOWN_MARKET',
      'DISABLED_MARKET',
      'NOT_ENOUGH_FUNDS',
      'NO_LIQUIDITY',
      'INVALID_FEE',
      'INVALID_QTY',
      'INVALID_PRICE',
      'INVALID_VALUE',
      'UNKNOWN_ACCOUNT',
      'SELF_TRADE_PROTECTION',
      'POST_ONLY_FAILED',
      'REDUCE_ONLY_FAILED',
      'INVALID_EXPIRE_TIME',
      'POSITION_TPSL_CONFLICT',
      'INVALID_LEVERAGE',
      'PREV_ORDER_NOT_FOUND',
      'PREV_ORDER_TRIGGERED',
      'TPSL_OTHER_SIDE_FILLED',
      'PREV_ORDER_CONFLICT',
      'ORDER_REPLACED',
      'POST_ONLY_MODE',
      'REDUCE_ONLY_MODE',
      'TRADING_OFF_MODE',
      'NEGATIVE_EQUITY',
      'ACCOUNT_LIQUIDATION',
    ])
    .optional(),
  type: z.enum(['LIMIT', 'CONDITIONAL', 'TPSL', 'TWAP']),
  side: z.enum(['BUY', 'SELL']),
  price: z.string().optional(),
  averagePrice: z.string().optional(),
  qty: z.string(),
  filledQty: z.string().optional(),
  payedFee: z.string().optional(),
  reduceOnly: z.boolean().optional(),
  postOnly: z.boolean().optional(),
  trigger: TriggerSchema.optional(),
  tpSlType: z.enum(['ORDER', 'POSITION']).optional(),
  takeProfit: TakeProfitSchema.optional(),
  stopLoss: StopLossSchema.optional(),
  createdTime: z.number(),
  updatedTime: z.number(),
  timeInForce: z.enum(['GTT', 'FOK', 'IOC']),
  expireTime: z.number(),
})

export const OpenOrdersResponseSchema = z.object({
  status: z.enum(['OK', 'ERROR']),
  data: z.array(OpenOrderSchema),
})
