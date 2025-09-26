import { z } from 'zod/v4'

import { zodLong } from '../utils/zod.ts'

export const PlacedOrderSchema = z.object({
  id: zodLong(),
  externalId: z.string(),
})

export const PlacedOrderResponseSchema = z.object({ data: PlacedOrderSchema })
