import { z } from 'zod/v4'

import { zodDecimal, zodHexString, zodLong } from '../utils/zod.ts'

export const MarketStatsSchema = z.object({
  dailyVolume: zodDecimal(),
  dailyVolumeBase: zodDecimal(),
  dailyPriceChange: zodDecimal(),
  dailyPriceChangePercentage: zodDecimal(),
  dailyLow: zodDecimal(),
  dailyHigh: zodDecimal(),
  lastPrice: zodDecimal(),
  askPrice: zodDecimal(),
  bidPrice: zodDecimal(),
  markPrice: zodDecimal(),
  indexPrice: zodDecimal(),
  fundingRate: zodDecimal(),
  nextFundingRate: zodLong(),
  openInterest: zodDecimal(),
  openInterestBase: zodDecimal(),
})

const TradingConfigSchema = z.object({
  minOrderSize: zodDecimal(),
  minOrderSizeChange: zodDecimal(),
  minPriceChange: zodDecimal(),
  maxMarketOrderValue: zodDecimal(),
  maxLimitOrderValue: zodDecimal(),
  maxPositionValue: zodDecimal(),
  maxLeverage: zodDecimal(),
  maxNumOrders: zodDecimal(),
  limitPriceCap: zodDecimal(),
  limitPriceFloor: zodDecimal(),
})

const L2ConfigSchema = z.object({
  type: z.string(),
  collateralId: zodHexString(),
  collateralResolution: z.number(),
  syntheticId: zodHexString(),
  syntheticResolution: z.number(),
})

export const MarketSchema = z.object({
  name: z.string(),
  category: z.string(),
  assetName: z.string(),
  assetPrecision: z.number(),
  collateralAssetName: z.string(),
  collateralAssetPrecision: z.number(),
  active: z.boolean(),
  status: z.enum(['ACTIVE', 'REDUCE_ONLY', 'DELISTED', 'PRELISTED', 'DISABLED']),
  visibleOnUi: z.boolean().default(true),
  createdAt: z.coerce.date(),
  marketStats: MarketStatsSchema,
  tradingConfig: TradingConfigSchema,
  l2Config: L2ConfigSchema,
})

export const MarketsResponseSchema = z.object({ data: z.array(MarketSchema) })

export type Market = z.infer<typeof MarketSchema>
