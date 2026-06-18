export interface OrderItemInput {
  productId: number
  quantity: number
}

export interface OrderPayload {
  customerName: string
  phone: string
  email: string
  address: string
  deliveryType: string
  paymentMethod: string
  items: OrderItemInput[]
}
