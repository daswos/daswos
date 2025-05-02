import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { type, billingCycle, stripeCustomerId, stripeSubscriptionId, action } = req.body;
      const userId = req.session.userId; // Assuming you have session management

      if (action === 'subscribe') {
        const subscription = await storage.createOrUpdateSubscription(
          userId,
          stripeCustomerId,
          stripeSubscriptionId,
          type,
          billingCycle
        );

        res.status(200).json({ success: true, subscription });
      } else {
        res.status(400).json({ success: false, message: 'Invalid action' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'An error occurred while updating the subscription' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}