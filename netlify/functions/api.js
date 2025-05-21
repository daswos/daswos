// Simple API handler for Netlify Functions
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  try {
    // Extract path and method from the event
    const path = event.path.replace('/.netlify/functions/api', '');
    const method = event.httpMethod;

    console.log(`API Request: ${method} ${path}`);

    // Handle different API endpoints
    if (path === '/health' || path === '/api/health') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          stripeConfigured: !!process.env.STRIPE_SECRET_KEY
        })
      };
    }

    // Handle Stripe checkout session creation
    if ((path === '/payment/create-coins-intent' || path === '/api/payment/create-coins-intent') && method === 'POST') {
      // Parse the request body
      const body = JSON.parse(event.body || '{}');
      const { amount = 10, coinAmount = 100 } = body;

      console.log(`Creating coins intent: amount=${amount}, coinAmount=${coinAmount}`);

      try {
        // If Stripe is configured, create a real checkout session
        if (process.env.STRIPE_SECRET_KEY) {
          // Calculate price in cents (Stripe uses smallest currency unit)
          const priceInCents = Math.round(parseFloat(amount) * 100);

          // Create a Stripe checkout session
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: `${coinAmount} DasWos Coins`,
                    description: 'Digital currency for the DasWos platform',
                  },
                  unit_amount: priceInCents,
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'https://daswos.netlify.app'}/daswos-coins/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'https://daswos.netlify.app'}/daswos-coins/cancel`,
            metadata: {
              coinAmount: coinAmount.toString(),
              userId: 'guest' // In a real implementation, this would be the user ID
            },
          });

          return {
            statusCode: 200,
            body: JSON.stringify({
              sessionId: session.id,
              url: session.url,
              amount,
              coinAmount
            })
          };
        } else {
          // Create a mock response for testing when Stripe is not configured
          console.log('Stripe not configured, returning mock response');
          return {
            statusCode: 200,
            body: JSON.stringify({
              sessionId: `test_session_${Date.now()}`,
              url: 'https://checkout.stripe.com/test-session',
              amount,
              coinAmount,
              mock: true
            })
          };
        }
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Payment Processing Error',
            message: stripeError.message,
            mock: !process.env.STRIPE_SECRET_KEY
          })
        };
      }
    }

    // Handle Stripe webhook
    if ((path === '/payment/webhook' || path === '/api/payment/webhook') && method === 'POST') {
      const sig = event.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      try {
        let stripeEvent;

        // Verify the webhook signature if we have a secret
        if (webhookSecret && sig && process.env.STRIPE_SECRET_KEY) {
          stripeEvent = stripe.webhooks.constructEvent(
            event.body,
            sig,
            webhookSecret
          );
        } else {
          // For development, just parse the payload
          stripeEvent = JSON.parse(event.body);
        }

        console.log('Received Stripe webhook event:', stripeEvent.type);

        // Handle checkout.session.completed event
        if (stripeEvent.type === 'checkout.session.completed') {
          const session = stripeEvent.data.object;

          // In a real implementation, you would add coins to the user's account here
          console.log(`Would add ${session.metadata.coinAmount} coins to user ${session.metadata.userId}`);

          // For now, just return success
          return {
            statusCode: 200,
            body: JSON.stringify({ received: true })
          };
        }

        // Return success for any other event type
        return {
          statusCode: 200,
          body: JSON.stringify({ received: true })
        };
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Webhook Error', message: webhookError.message })
        };
      }
    }

    // Default response for unhandled endpoints
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not Found', path, method })
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
};
