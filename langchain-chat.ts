// Natural language AI chat with product search capabilities
import { Router, Request, Response, Express } from 'express';
import { IStorage } from '../storage';
import { searchProducts } from '../simple-product-search';
import { log } from '../vite';
import { sendToAnthropic, AnthropicMessage } from '../anthropic-api';

export function setupLangchainChatRoutes(app: Express | Router, storage: IStorage) {
  // Create a router if we're passed the Express app
  const route = 'use' in app ? Router() : app;

  // Chat endpoint that supports natural language product search
  route.post('/api/user/langchain-chat', async (req: Request, res: Response) => {
    try {
      // Allow both authenticated and unauthenticated users
      const userId = req.isAuthenticated() ? req.user.id : null;
      
      // Get user message
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Log the chat request
      log(`LangChain chat request from user ${userId || 'guest'}: ${message}`, 'info');
      
      // Check if this is a how-to-use query
      const isHowToUseQuery = /how\s+to\s+use|what\s+can\s+you\s+do|help\s+me\s+use|capabilities|features/i.test(message);
      
      if (isHowToUseQuery) {
        // Provide a standard response about how to use the assistant
        return res.json({
          response: `I'm Daswos AI, your personal shopping assistant! Here's how I can help you:

1. **Product Search**: Ask me to find products like "Find comfortable office chairs under $200" or "Show me gaming laptops with good battery life"
2. **Product Recommendations**: Tell me what you're looking for, and I'll suggest the best options
3. **Shopping Advice**: Ask me questions about products, features, or get shopping tips
4. **Price Comparisons**: I can help you compare different products and find the best value
5. **Trusted Products**: I'll highlight products with high trust scores from verified sellers

Try asking something like "Find me red running shoes" or "What are some good wireless headphones under $100?"`,
          recommendations: []
        });
      }

      // Check if this is a product search query - we consider almost all queries product searches
      // to ensure we use our database instead of general AI responses
      const nonProductTerms = ["how to use", "what is daswos", "who are you", "help me understand", "tell me about yourself"];
      const isDefinitelyNotProductSearch = nonProductTerms.some(term => message.toLowerCase().includes(term));

      // Also check for product keywords to be extra sure we catch product searches
      const productKeywords = ["nike", "shoes", "red", "laptop", "hat", "find", "search", "looking for", 
                             "recommend", "show me", "want", "need", "buy", "shop", "where", "adidas",
                             "product", "purchase", "get", "colors", "size", "model", "brand"];
      
      const containsProductKeyword = productKeywords.some(keyword => message.toLowerCase().includes(keyword));
      
      // Consider it a product search unless it's definitely not one
      const isProductSearch = !isDefinitelyNotProductSearch || containsProductKeyword;
      
      if (isProductSearch) {
        // This looks like a product search, use LangChain to search and recommend products
        try {
          console.log(`[LangChain] Product search request for: "${message}"`);
          // Search for products using our simple implementation
          const result = await searchProducts(message, 5);
          console.log(`[LangChain] Search results: ${result.products.length} products found, response: "${result.response.substring(0, 50)}..."`);
          const response = result.response;
          const recommendedProducts = result.products;
          
          // Save the search query for authenticated users
          if (userId) {
            await storage.saveSearchQuery({
              userId,
              query: message,
              sphere: 'safesphere',
              contentType: 'products'
            });
          }
          
          // Return the response with recommendations
          return res.json({
            response,
            recommendations: recommendedProducts.map(product => ({
              id: product.id,
              product: {
                id: product.id,
                title: product.title,
                price: product.price,
                description: product.description,
                imageUrl: product.image_url,
                sellerName: product.seller_name,
                sellerVerified: product.seller_verified,
                trustScore: product.trust_score,
                tags: product.tags
              },
              reason: `This ${product.title} matches your search criteria and has a trust score of ${product.trust_score}.`,
              confidence: 0.85,
              status: 'pending'
            }))
          });
        } catch (error) {
          log(`Error in LangChain product search: ${error}`, 'error');
          
          console.log(`[LangChain] Product search error: ${error}`);
          
          // Don't fall back to standard Anthropic response for product searches
          // Instead, tell the user we couldn't find matching products in our database
          // IMPORTANT: Don't use 500 error status here - return 200 with a helpful message
          // This prevents the error UI flow in the frontend
          return res.status(200).json({
            response: `I'm sorry, but I couldn't find any products in our database that match "${message}". We have items like "Nike Air Zoom Pegasus 38 Red" and "Adidas Ultraboost 22 Red Edition" in our inventory. Could you try a search for one of these or a similar product?`,
            recommendations: []
          });
        }
      } else {
        // This is a general query, use standard Anthropic response
        const messages: AnthropicMessage[] = [
          { role: 'user', content: message }
        ];
        
        const response = await sendToAnthropic(messages);
        
        return res.json({
          response,
          recommendations: []
        });
      }
    } catch (error) {
      log(`Error in LangChain chat endpoint: ${error}`, 'error');
      res.status(500).json({ error: 'An error occurred while processing your request' });
    }
  });

  // Optional: Add additional endpoints for more advanced functionality

  // Return the router if we created one
  if ('use' in app) {
    app.use(route);
  }
}