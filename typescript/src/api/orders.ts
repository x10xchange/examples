import { withActiveAccount } from '../utils/api.ts'
import { axiosClient } from './axios.ts'
import { UserOrdersResponseSchema } from './orders.schema.ts'

export const getOrders = async ({
  accountId,
  marketsNames,
}: {
  accountId: string
  marketsNames?: string[]
}) => {
  const { data } = await axiosClient.get<unknown>('/api/v1/user/orders', {
    params: {
      market: marketsNames,
    },
    headers: withActiveAccount(accountId),
  })

  return UserOrdersResponseSchema.parse(data).data
}
