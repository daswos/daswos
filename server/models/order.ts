import { Schema, model, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  sellerId: Types.ObjectId;
  totalAmount: number;
}

const orderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  totalAmount: { type: Number, required: true }
});

const Order = model<IOrder>('Order', orderSchema);
export default Order;


