import { Router } from 'express';
import { z } from 'zod';
import { IStorage } from '../storage';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the Stripe secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

export function createStripeConnectRoutes(storage: IStorage) {
  const router = Router();

  // Create a Stripe Connect account link for seller onboarding
  router.post('/create-account-link', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to become a seller" });
      }

      const userId = req.user.id;
      const user = await storage.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user already has a Stripe account ID
      if (user.stripeAccountId) {
        // If they have an account but need to complete onboarding, create a new account link
        const accountLink = await stripe.accountLinks.create({
          account: user.stripeAccountId,
          refresh_url: `${process.env.CLIENT_URL}/seller/onboarding?refresh=true`,
          return_url: `${process.env.CLIENT_URL}/seller/dashboard`,
          type: 'account_onboarding',
        });

        return res.json({ url: accountLink.url });
      }

      // Create a new Stripe Connect account for the seller
      const account = await stripe.accounts.create({
        type: 'express', // Use 'standard' or 'express' based on your needs
        email: user.email,
        metadata: {
          userId: userId.toString(),
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      // Save the Stripe account ID to the user record
      await storage.updateUserStripeAccount(userId, account.id);

      // Create an account link for the user to onboard
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.CLIENT_URL}/seller/onboarding?refresh=true`,
        return_url: `${process.env.CLIENT_URL}/seller/dashboard`,
        type: 'account_onboarding',
      });

      res.json({ url: accountLink.url });
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error);
      res.status(500).json({ error: "Failed to create seller account" });
    }
  });

  // Get seller account status
  router.get('/account-status', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to check seller status" });
      }

      const userId = req.user.id;
      const user = await storage.getUserById(userId);

      if (!user || !user.stripeAccountId) {
        return res.json({ 
          hasAccount: false,
          accountStatus: null
        });
      }

      // Get the account details from Stripe
      const account = await stripe.accounts.retrieve(user.stripeAccountId);

      // Check if the account is fully onboarded
      const isFullyOnboarded = 
        account.details_submitted && 
        account.charges_enabled && 
        account.payouts_enabled;

      res.json({
        hasAccount: true,
        accountId: user.stripeAccountId,
        isFullyOnboarded,
        accountStatus: {
          detailsSubmitted: account.details_submitted,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          requirements: account.requirements
        }
      });
    } catch (error) {
      console.error('Error getting Stripe Connect account status:', error);
      res.status(500).json({ error: "Failed to get seller account status" });
    }
  });

  // Create a login link for an existing Connect account
  router.get('/login-link', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to access your seller account" });
      }

      const userId = req.user.id;
      const user = await storage.getUserById(userId);

      if (!user || !user.stripeAccountId) {
        return res.status(404).json({ error: "Stripe account not found" });
      }

      // Create a login link for the user to access their Stripe Express dashboard
      const loginLink = await stripe.accounts.createLoginLink(user.stripeAccountId);

      res.json({ url: loginLink.url });
    } catch (error) {
      console.error('Error creating Stripe Connect login link:', error);
      res.status(500).json({ error: "Failed to create login link" });
    }
  });

  // Webhook for Stripe Connect events
  router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

    let event;

    try {
      // Verify webhook signature
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        // For development, just parse the JSON
        event = req.body;
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'account.updated':
        const account = event.data.object;
        console.log('Stripe Connect account updated:', account.id);
        
        // Find the user with this Stripe account ID
        try {
          const user = await storage.getUserByStripeAccountId(account.id);
          if (user) {
            // Update the user's seller status based on the account status
            const isFullyOnboarded = 
              account.details_submitted && 
              account.charges_enabled && 
              account.payouts_enabled;
            
            await storage.updateUserSellerStatus(user.id, isFullyOnboarded);
            console.log(`Updated seller status for user ${user.id} to ${isFullyOnboarded}`);
          }
        } catch (error) {
          console.error('Error updating user seller status:', error);
        }
        break;
        
      default:
        console.log(`Unhandled Connect event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  });

  return router;
}
