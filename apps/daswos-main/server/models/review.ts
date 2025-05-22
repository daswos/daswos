import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  sellerId: Types.ObjectId;
  rating: number;
  reviewText: string;
  photoUrl?: string;
  hasPhoto: boolean;
  reported: boolean;
  reportReason?: string;
  reportDetails?: string;
  reportedAt?: Date;
  reportedBy?: Types.ObjectId;
  reportVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    hasPhoto: {
      type: Boolean,
      default: false,
    },
    reported: {
      type: Boolean,
      default: false,
    },
    reportReason: {
      type: String,
      enum: ['not_item', 'modified_item', 'inappropriate', 'other'],
    },
    reportDetails: {
      type: String,
    },
    reportedAt: {
      type: Date,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reportVerified: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
reviewSchema.index({ orderId: 1 }, { unique: true });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ productId: 1 });
reviewSchema.index({ sellerId: 1 });

const Review = model<IReview>('Review', reviewSchema);

export default Review;
