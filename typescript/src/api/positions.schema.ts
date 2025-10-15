import { z } from 'zod/v4'

import { zodLong } from '../utils/zod.ts'

export const PositionSchema = z.object({
  id: zodLong(),
  accountId: z.number(),
  market: z.string(),
  side: z.enum(['LONG', 'SHORT']),
  leverage: z.string(),
  size: z.string(),
  value: z.string(),
  openPrice: z.string(),
  markPrice: z.string(),
  liquidationPrice: z.string(),
  margin: z.string(),
  unrealisedPnl: z.string(),
  realisedPnl: z.string(),
  tpTriggerPrice: z.string().optional(),
  tpLimitPrice: z.string().optional(),
  slTriggerPrice: z.string().optional(),
  slLimitPrice: z.string().optional(),
  maxPositionSize: z.string().optional(),
  adl: z.number(),
  createdTime: z.number().optional(),
  updatedTime: z.number().optional(),
})

export const PositionsResponseSchema = z.object({
  status: z.enum(['OK', 'ERROR']),
  data: z.array(PositionSchema),
})
