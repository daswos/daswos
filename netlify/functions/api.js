// Simple API handler for Netlify Functions
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
        body: JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() })
      };
    }

    if ((path === '/payment/create-coins-intent' || path === '/api/payment/create-coins-intent') && method === 'POST') {
      // Parse the request body
      const body = JSON.parse(event.body || '{}');
      const { amount, coinAmount } = body;

      console.log(`Creating coins intent: amount=${amount}, coinAmount=${coinAmount}`);

      // Create a mock response for testing
      return {
        statusCode: 200,
        body: JSON.stringify({
          sessionId: `test_session_${Date.now()}`,
          url: 'https://checkout.stripe.com/test-session',
          amount: amount || 10,
          coinAmount: coinAmount || 100
        })
      };
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
