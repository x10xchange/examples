import { z } from 'zod/v4'

import { zodDecimal, zodLong } from '../utils/zod.ts'

export const UserPositionSchema = z
  .object({
    id: zodLong(),
    accountId: z.number().positive(),
    market: z.string(),
    status: z.enum(['OPENED', 'CLOSED']),
    side: z.enum(['LONG', 'SHORT']),
    leverage: zodDecimal(),
    size: zodDecimal(),
    value: zodDecimal(),
    openPrice: zodDecimal(),
    markPrice: zodDecimal(),
    liquidationPrice: zodDecimal().optional(),
    margin: zodDecimal(),
    unrealisedPnl: zodDecimal(),
    midPriceUnrealisedPnl: zodDecimal(),
    realisedPnl: zodDecimal(),
    tpTriggerPrice: zodDecimal().optional(),
    tpLimitPrice: zodDecimal().optional(),
    slTriggerPrice: zodDecimal().optional(),
    slLimitPrice: zodDecimal().optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
  })

export const UserPositionsResponseSchema = z.object({ data: UserPositionSchema.array() })
