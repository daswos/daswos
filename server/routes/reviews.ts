import express, { Request, Response, RequestHandler } from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import Review from '../models/review';
import Order from '../models/order';
import User from '../models/user';
import upload from '../middleware/upload';
import { Types } from 'mongoose';
import { User as UserType } from '@shared/schema';

interface AuthenticatedRequest extends Request {
  user: UserType;
}

// Helper function to handle type assertion for authenticated routes
const authenticatedHandler = (handler: (req: AuthenticatedRequest, res: Response) => Promise<any>): RequestHandler => {
  return async (req: Request, res: Response) => {
    await handler(req as AuthenticatedRequest, res);
  };
};

const router = express.Router();

// Get reviews for the current user (as a buyer)
router.get('/user', isAuthenticated as RequestHandler, authenticatedHandler(async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .populate('orderId', 'orderNumber totalAmount')
      .populate('productId', 'name description imageUrl')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
}));

// Get reviews for the current user's sold items (as a seller)
router.get('/seller', isAuthenticated as RequestHandler, authenticatedHandler(async (req, res) => {
  try {
    const reviews = await Review.find({ sellerId: req.user.id })
      .populate('userId', 'username')
      .populate('productId', 'name description imageUrl')
      .populate('orderId', 'orderNumber totalAmount')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching seller reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
}));

// Get reviews for a specific seller by ID (public endpoint)
router.get('/seller/:id', async (req, res) => {
  try {
    const sellerId = req.params.id;

    // Validate seller ID
    if (!sellerId) {
      return res.status(400).json({ success: false, message: 'Seller ID is required' });
    }

    // Find reviews for this seller
    const reviews = await Review.find({ sellerId })
      .populate('userId', 'username')
      .populate('productId', 'name description imageUrl')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching seller reviews by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// Get reviews for a specific product by ID (public endpoint)
router.get('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate product ID
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Find reviews for this product
    const reviews = await Review.find({ productId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching product reviews by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// Submit a new review
router.post('/', isAuthenticated as RequestHandler, upload.single('photo'), authenticatedHandler(async (req, res) => {
  try {
    const { orderId, rating, reviewText } = req.body;

    // Validate input
    if (!orderId || !rating) {
      return res.status(400).json({ success: false, message: 'Order ID and rating are required' });
    }

    // Check if order exists and belongs to the user
    const order = await Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or does not belong to you' });
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this order' });
    }

    // Create the review
    const newReview = new Review({
      orderId,
      userId: req.user.id,
      productId: order.productId,
      sellerId: order.sellerId,
      rating: parseInt(rating),
      reviewText,
      hasPhoto: !!req.file
    });

    // If a photo was uploaded, save the URL
    if (req.file) {
      const photoUrl = `/uploads/reviews/${req.file.filename}`;
      newReview.photoUrl = photoUrl;

      // Award 1 DasWos coin for including a photo
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { coins: 1 }
      });
    }

    await newReview.save();

    res.json({
      success: true,
      message: 'Review submitted successfully',
      data: newReview,
      coinAwarded: !!req.file
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
}));

// Report a review photo
router.post('/report', isAuthenticated as RequestHandler, authenticatedHandler(async (req, res) => {
  try {
    const { reviewId, reason, additionalInfo } = req.body;

    // Validate input
    if (!reviewId || !reason) {
      return res.status(400).json({ success: false, message: 'Review ID and reason are required' });
    }

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if the user is the seller of the item
    if (review.sellerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only report reviews for items you sold' });
    }

    // Check if the review has a photo
    if (!review.hasPhoto || !review.photoUrl) {
      return res.status(400).json({ success: false, message: 'This review does not have a photo to report' });
    }

    // Check if the review is already reported
    if (review.reported) {
      return res.status(400).json({ success: false, message: 'This review has already been reported' });
    }

    // Update the review with report information
    review.reported = true;
    review.reportReason = reason;
    review.reportDetails = additionalInfo;
    review.reportedAt = new Date();
    review.reportedBy = new Types.ObjectId(req.user.id.toString());

    await review.save();

    // Award 2 DasWos coins to the seller for reporting
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { coins: 2 }
    });

    res.json({
      success: true,
      message: 'Review reported successfully',
      coinsAwarded: 2
    });
  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).json({ success: false, message: 'Failed to report review' });
  }
}));

// Admin routes for review photo verification

// Get all reported reviews
router.get('/admin/reported-reviews',
  isAuthenticated as RequestHandler,
  isAdmin as RequestHandler,
  authenticatedHandler(async (_, res) => {
    try {
      const reportedReviews = await Review.find({ reported: true, reportVerified: { $exists: false } })
        .populate('userId', 'username')
        .populate('productId', 'name description imageUrl')
        .sort({ reportedAt: -1 });

      res.json({ success: true, data: reportedReviews });
    } catch (error) {
      console.error('Error fetching reported reviews:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch reported reviews' });
    }
  }));

// Verify a reported review photo
router.post('/admin/reviews/verify/:id', isAuthenticated as RequestHandler, isAdmin as RequestHandler, authenticatedHandler(async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (!review.reported) {
      return res.status(400).json({ success: false, message: 'This review is not reported' });
    }

    review.reportVerified = true;
    await review.save();

    res.json({
      success: true,
      message: 'Review photo verified successfully'
    });
  } catch (error) {
    console.error('Error verifying review photo:', error);
    res.status(500).json({ success: false, message: 'Failed to verify review photo' });
  }
}));

// Reject a reported review photo
router.post('/admin/reviews/reject/:id', isAuthenticated as RequestHandler, isAdmin as RequestHandler, authenticatedHandler(async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (!review.reported) {
      return res.status(400).json({ success: false, message: 'This review is not reported' });
    }

    // Update the review
    review.reportVerified = false;
    review.photoUrl = undefined;
    review.hasPhoto = false;
    await review.save();

    // Handle coin deduction and awards
    await Promise.all([
      // Deduct coin from reviewer
      User.findByIdAndUpdate(review.userId, {
        $inc: { coins: -1 }
      }),
      // Award additional coin to seller
      User.findByIdAndUpdate(review.sellerId, {
        $inc: { coins: 1 }
      })
    ]);

    res.json({
      success: true,
      message: 'Review photo rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting review photo:', error);
    res.status(500).json({ success: false, message: 'Failed to reject review photo' });
  }
}));

export default router;

















