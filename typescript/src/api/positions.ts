import { axiosClient } from './axios.ts'
import { PositionsResponseSchema } from './positions.schema.ts'

export const getPositions = async (args?: { market?: string; side?: 'LONG' | 'SHORT' }) => {
  const params = new URLSearchParams()

  if (args?.market) {
    params.append('market', args.market)
  }

  if (args?.side) {
    params.append('side', args.side)
  }

  const queryString = params.toString()
  const url = `/api/v1/user/positions${queryString ? `?${queryString}` : ''}`

  const { data } = await axiosClient.get<unknown>(url)

  return PositionsResponseSchema.parse(data).data
}
