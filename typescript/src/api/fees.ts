import { axiosClient } from './axios.ts'
import { FeesResponseSchema } from './fees.schema.ts'

export const getFees = async (marketName: string) => {
  const { data } = await axiosClient.get<unknown>('/api/v1/user/fees', {
    params: {
      market: [marketName],
    },
  })

  return FeesResponseSchema.parse(data).data[0]
}
