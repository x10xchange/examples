import { axiosClient } from './axios.ts'
import { OpenOrdersResponseSchema } from './open-orders.schema.ts'

export const getOpenOrders = async (args?: {
  market?: string | string[]
  type?: 'LIMIT' | 'CONDITIONAL' | 'TPSL' | 'TWAP'
  side?: 'BUY' | 'SELL'
}) => {
  const params = new URLSearchParams()

  if (args?.market) {
    if (Array.isArray(args.market)) {
      args.market.forEach((m) => params.append('market', m))
    } else {
      params.append('market', args.market)
    }
  }

  if (args?.type) {
    params.append('type', args.type)
  }

  if (args?.side) {
    params.append('side', args.side)
  }

  const queryString = params.toString()
  const url = `/api/v1/user/orders${queryString ? `?${queryString}` : ''}`

  const { data } = await axiosClient.get<unknown>(url)

  return OpenOrdersResponseSchema.parse(data).data
}
