import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  id: string;
  username: string;
  coins: number;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  coins: { type: Number, default: 0 }
});

const User = model<IUser>('User', userSchema);
export default User;



