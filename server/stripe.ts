import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the Stripe secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Create a Stripe instance with the secret key
const stripe = new Stripe(stripeSecretKey || 'sk_test_51R4JTaJXxGsELwt7APbdYxObAAnCtnYANiCQAB28Q3M4UC6zHYiZKuGu7VluVU861rD5XXLDyxXYyW9EAcbQs91X00mUhfKO0L', {
  apiVersion: '2025-02-24.acacia',
});

export interface StripeProductPrices {
  individual: {
    monthly: string;
    annual: string;
  };
  family: {
    monthly: string;
    annual: string;
  };
  standard?: {
    monthly: string;
    annual: string;
  };
}

// Fixed price IDs for subscription products
// In a real app, these would be created and managed in the Stripe dashboard
// and stored in the database or environment variables
const productPrices: StripeProductPrices = {
  individual: {
    monthly: 'price_individual_monthly', // These would be actual Stripe price IDs in production
    annual: 'price_individual_annual',
  },
  family: {
    monthly: 'price_family_monthly',
    annual: 'price_family_annual',
  }
};

// Create a customer in Stripe
export async function createCustomer(email: string, name: string): Promise<string> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });
    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create customer in Stripe');
  }
}

// Create a payment intent for a subscription
export async function createPaymentIntent(
  amount: number, 
  currency: string = 'gbp',
  customerId?: string
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to smallest currency unit (pence)
      currency,
      customer: customerId,
      payment_method_types: ['card'],
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

// Create a subscription
export async function createSubscription(
  customerId: string,
  priceId: string,
  paymentMethodId: string
): Promise<Stripe.Subscription> {
  try {
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    // Set it as the default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

// Helper function to get price by plan and cycle
export function getPriceId(planType: 'individual' | 'family' | 'standard', billingCycle: 'monthly' | 'annual'): string {
  if (planType === 'standard') {
    // Standard plan is free, so we don't have a price ID for it
    return 'price_standard_free';
  }
  return productPrices[planType][billingCycle];
}

// Get plan amount in pounds
export function getPlanAmount(planType: 'individual' | 'family' | 'standard', billingCycle: 'monthly' | 'annual'): number {
  if (planType === 'standard') {
    return 0; // Standard (free) plan costs nothing
  } else if (planType === 'individual') {
    return billingCycle === 'monthly' ? 3 : 30;
  } else {
    return billingCycle === 'monthly' ? 7 : 70;
  }
}

export { stripe };