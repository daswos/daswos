import { Request, Response, Router } from 'express';
import type { Express } from 'express';
import { z } from 'zod';
import { anthropic } from '../anthropic-client';
import { ApiError } from '../errors';
import type { IStorage } from '../storage';

// Validation schema for seller AI product suggestions
const sellerAiSuggestionSchema = z.object({
  query: z.string().min(2)
});

interface AIProductSuggestion {
  category: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  confidence: number;
}

export function setupSellerAiRoutes(app: Express | Router, storage: IStorage): void {
  // Create a handler function
  const handleAiSuggestions = async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validation = sellerAiSuggestionSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ApiError('Invalid request body', 400, validation.error);
      }

      const { query } = validation.data;

      // Get suggestions from Anthropic's Claude (or fall back to mock data if unavailable)
      let suggestions: AIProductSuggestion[];
      
      try {
        const prompt = `
          You are an AI product listing assistant for the Daswos marketplace.
          
          A seller is trying to list this product: "${query}"
          
          Your task is to analyze this product description and generate 1-3 optimized listings that would help the product sell better. 
          
          For each suggestion, you should provide:
          1. A recommended category (choose from: electronics, clothing, home, toys, beauty, sports, books, automotive, other)
          2. A compelling product title (max 100 characters)
          3. A detailed product description (max 500 characters)
          4. A recommended price in USD
          5. A list of 5-8 relevant search tags
          6. A confidence score (0-100) indicating how certain you are about the suggestion
          
          Format your response as a valid JSON array of objects with the following structure:
          [
            {
              "category": "string",
              "title": "string",
              "description": "string",
              "price": number,
              "tags": ["string", "string", ...],
              "confidence": number
            },
            ...
          ]
          
          Respond with ONLY the JSON array and no additional text.
        `;

        const response = await anthropic.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: 1500,
          temperature: 0.7,
          system: "You are an AI product listing assistant that generates optimized product listings from basic descriptions. You always respond with valid JSON only.",
          messages: [
            { role: "user", content: prompt }
          ]
        });

        // Get the text content from response
        let responseContent = '';
        if (response.content && response.content.length > 0) {
          // Handle different content types from Anthropic API
          const content = response.content[0];
          if (typeof content === 'object') {
            if (content.type === 'text' && typeof content.text === 'string') {
              responseContent = content.text;
            } else {
              // Access property as any type to bypass TypeScript checking
              const textContent = (content as any).text;
              if (typeof textContent === 'string') {
                responseContent = textContent;
              }
            }
          } else if (typeof content === 'string') {
            responseContent = content;
          }
        }
        
        console.log('Raw response content:', responseContent);
        
        // Try to parse the response as JSON
        try {
          suggestions = JSON.parse(responseContent);
          
          // Validate the suggestions format
          if (!Array.isArray(suggestions)) {
            throw new Error('Response is not an array');
          }
          
          // Ensure each suggestion has the required fields
          suggestions = suggestions.map(suggestion => {
            return {
              category: suggestion.category || 'other',
              title: suggestion.title || 'Product Title',
              description: suggestion.description || 'Product Description',
              price: typeof suggestion.price === 'number' ? suggestion.price : 0,
              tags: Array.isArray(suggestion.tags) ? suggestion.tags : [],
              confidence: typeof suggestion.confidence === 'number' ? suggestion.confidence : 50
            };
          });
          
        } catch (error) {
          console.error('Failed to parse AI response as JSON:', error);
          console.log('Raw AI response:', responseContent);
          
          // Fallback to mock data
          suggestions = [
            {
              category: 'electronics',
              title: 'Wireless Bluetooth Headphones',
              description: 'High-quality over-ear headphones with noise cancellation, 20-hour battery life, and comfortable design for all-day wear.',
              price: 129.99,
              tags: ['wireless', 'bluetooth', 'headphones', 'audio', 'noise-cancellation'],
              confidence: 92
            },
            {
              category: 'electronics',
              title: 'Premium Bluetooth Earbuds',
              description: 'Compact wireless earbuds with charging case, water resistance, and crystal clear sound quality for music and calls.',
              price: 89.99,
              tags: ['wireless', 'bluetooth', 'earbuds', 'audio', 'water-resistant'],
              confidence: 89
            }
          ];
        }
        
      } catch (error) {
        console.error('AI suggestion generation error:', error);
        
        // Fallback to mock data
        suggestions = [
          {
            category: 'electronics',
            title: 'Wireless Bluetooth Headphones',
            description: 'High-quality over-ear headphones with noise cancellation, 20-hour battery life, and comfortable design for all-day wear.',
            price: 129.99,
            tags: ['wireless', 'bluetooth', 'headphones', 'audio', 'noise-cancellation'],
            confidence: 92
          },
          {
            category: 'electronics',
            title: 'Premium Bluetooth Earbuds',
            description: 'Compact wireless earbuds with charging case, water resistance, and crystal clear sound quality for music and calls.',
            price: 89.99,
            tags: ['wireless', 'bluetooth', 'earbuds', 'audio', 'water-resistant'],
            confidence: 89
          }
        ];
      }

      // Log for analytics purposes
      console.log(`Generated ${suggestions.length} AI suggestions for query: "${query}"`);
      
      // Store the query for analytics (optional)
      await storage.saveSearchQuery({
        query,
        userId: req.isAuthenticated() ? req.user.id : null,
        sphere: 'seller_ai', // Use sphere instead of type
        timestamp: new Date()
      });
      
      // Return the suggestions
      return res.status(200).json(suggestions);
      
    } catch (error) {
      console.error('Error in seller AI suggestions:', error);
      if (error instanceof ApiError) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to generate product suggestions' });
    }
  };
  
  // Register the route handler
  app.post('/api/seller/ai-suggestions', handleAiSuggestions);
}