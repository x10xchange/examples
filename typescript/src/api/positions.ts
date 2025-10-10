import { withActiveAccount } from '../utils/api.ts'
import { axiosClient } from './axios.ts'
import { UserPositionsResponseSchema } from './positions.schema.ts'

export const getPositions = async ({
  accountId,
  marketsNames,
}: {
  accountId: string
  marketsNames?: string[]
}) => {
  const { data } = await axiosClient.get<unknown>('/api/v1/user/positions', {
    params: {
      market: marketsNames,
    },
    headers: withActiveAccount(accountId),
  })

  return UserPositionsResponseSchema.parse(data).data
}
