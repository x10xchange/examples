import { OrderSide } from '../models/types.ts'

export const getOppositeOrderSide = (side: OrderSide) => {
  return side === 'BUY' ? 'SELL' : 'BUY'
}
