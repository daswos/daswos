import { Router, Request, Response } from 'express';
import { createSafeCompletion } from '../anthropic-client';
import { IStorage } from '../storage';

export function setupAiSearchRoutes(router: Router, storage: IStorage) {
  // AI-enhanced search API route
  router.get('/api/ai-search', async (req: Request, res: Response) => {
    try {
      const { query, type } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      // Determine if we're searching for information or products
      const searchType = (type === 'shopping') ? 'shopping' : 'information';

      // SuperSafe Mode parameters
      const superSafeEnabled = req.query.superSafeEnabled === 'true';
      const blockGambling = req.query.blockGambling === 'true';
      const blockAdultContent = req.query.blockAdultContent === 'true';
      const blockOpenSphere = req.query.blockOpenSphere === 'true';

      // Get AI-generated response
      const aiResponse = await getAiResponse(
        query as string,
        searchType,
        storage,
        {
          superSafeEnabled,
          blockGambling,
          blockAdultContent,
          blockOpenSphere
        }
      );

      // Return the response
      res.json(aiResponse);
    } catch (error) {
      console.error('Error in AI search:', error);

      // Return a user-friendly error without exposing details
      res.json({
        text: 'I apologize, but I encountered an issue processing your request. Please try again later.',
        hasAudio: false
      });
    }
  });
}

async function getAiResponse(
  query: string,
  type: string,
  storage: IStorage,
  superSafeSettings?: {
    superSafeEnabled: boolean;
    blockGambling: boolean;
    blockAdultContent: boolean;
    blockOpenSphere: boolean;
  }
) {
  try {
    // Fetch related information content if in information mode
    let relatedContent = [];

    try {
      if (type === 'information') {
        relatedContent = await storage.getInformationContent(query as string);
      } else if (type === 'shopping') {
        // Extract potential product keywords from the query for better matching
        const productKeywords = await extractProductKeywords(query);
        console.log('Extracted product keywords:', productKeywords);

        // Determine which sphere to use based on SuperSafe settings
        let sphere = 'safesphere';

        // If SuperSafe Mode is enabled and has specific settings, apply them
        if (superSafeSettings?.superSafeEnabled) {
          console.log('SuperSafe Mode enabled for AI search');

          // Force SafeSphere if OpenSphere is blocked
          if (superSafeSettings.blockOpenSphere) {
            sphere = 'safesphere';
            console.log('SuperSafe Mode: Forcing SafeSphere for AI search');
          }
        }

        // Try to find products with the keywords
        for (const keyword of productKeywords) {
          // Only try if the keyword is meaningful (at least 3 chars)
          if (keyword.length >= 3) {
            // Skip gambling-related keywords if SuperSafe Mode blocks gambling
            if (superSafeSettings?.superSafeEnabled &&
                superSafeSettings.blockGambling &&
                isGamblingRelated(keyword)) {
              console.log(`SuperSafe Mode: Skipping gambling-related keyword "${keyword}"`);
              continue;
            }

            // Skip adult content keywords if SuperSafe Mode blocks adult content
            if (superSafeSettings?.superSafeEnabled &&
                superSafeSettings.blockAdultContent &&
                isAdultContentRelated(keyword)) {
              console.log(`SuperSafe Mode: Skipping adult content keyword "${keyword}"`);
              continue;
            }

            const products = await storage.getProducts(sphere, keyword);
            if (products && products.length > 0) {
              // Add these products to our results
              relatedContent = [...relatedContent, ...products];
              // We might find duplicates, so let's remove them
              relatedContent = Array.from(new Map(relatedContent.map(item => [item.id, item])).values());

              // If we've found enough products, we can stop searching
              if (relatedContent.length >= 5) break;
            }
          }
        }

        // If we didn't find any products with keywords, fall back to the original query
        if (relatedContent.length === 0) {
          relatedContent = await storage.getProducts(sphere, query as string);
        }

        // Apply SuperSafe Mode filters to the results if enabled
        if (superSafeSettings?.superSafeEnabled) {
          // Filter out gambling-related products if blockGambling is enabled
          if (superSafeSettings.blockGambling) {
            const gamblingKeywords = ['gambling', 'casino', 'poker', 'betting', 'lottery', 'slot', 'roulette'];
            relatedContent = relatedContent.filter(product => {
              const title = product.title.toLowerCase();
              const description = product.description.toLowerCase();
              const tags = product.tags.map(tag => tag.toLowerCase());

              // Check if any gambling keywords are in the title, description, or tags
              return !gamblingKeywords.some(keyword =>
                title.includes(keyword) ||
                description.includes(keyword) ||
                tags.includes(keyword)
              );
            });
            console.log(`SuperSafe Mode: Filtered out gambling-related products, ${relatedContent.length} remaining`);
          }

          // Filter out adult content if blockAdultContent is enabled
          if (superSafeSettings.blockAdultContent) {
            const adultKeywords = ['adult', 'mature', 'xxx', 'nsfw', 'explicit', 'erotic'];
            relatedContent = relatedContent.filter(product => {
              const title = product.title.toLowerCase();
              const description = product.description.toLowerCase();
              const tags = product.tags.map(tag => tag.toLowerCase());

              // Check if any adult keywords are in the title, description, or tags
              return !adultKeywords.some(keyword =>
                title.includes(keyword) ||
                description.includes(keyword) ||
                tags.includes(keyword)
              );
            });
            console.log(`SuperSafe Mode: Filtered out adult content, ${relatedContent.length} remaining`);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching related content:', error);
      // Continue with empty related content if there was an error
    }

    // Format the related content for the AI prompt
    const relatedContentPrompt = formatRelatedContentForPrompt(relatedContent, type);

    // Construct the prompt for Anthropic Claude
    const systemPrompt = `You are an AI assistant for the Daswos platform, a collaborative purchasing and information sharing platform.
Your task is to provide helpful, accurate information in response to user queries.
${type === 'information'
  ? 'For information queries, focus on providing factual, well-structured responses with citations where possible.'
  : `For shopping queries, you should:
- Keep your responses extremely brief (1 sentence maximum)
- Ask a single, direct question related to the specific item type
- For queries about shoes, specifically respond with "What type of shoes?" as the entire response
- For other products, ask a simple clarifying question about type, style, or key feature
- Avoid any introduction, pleasantries, or descriptive text

The matching products will be displayed automatically in the shopping results area, so you don't need to describe them.`}

${relatedContentPrompt && type === 'information' ? `Here are some relevant items from our database you can reference in your response:
${relatedContentPrompt}` : ''}

Format your response in a direct, simple way. For shopping queries, use only a single short question.

${superSafeSettings?.superSafeEnabled ? `
IMPORTANT: SuperSafe Mode is enabled. Please ensure your responses are family-friendly and appropriate for all ages.
${superSafeSettings.blockGambling ? '- Do not provide information about gambling or betting.' : ''}
${superSafeSettings.blockAdultContent ? '- Do not provide information about adult or explicit content.' : ''}
` : ''}

${type === 'shopping' ? 'IMPORTANT: We already show the products in the results. DO NOT describe specific products or mention prices. If the query is about shoes, respond ONLY with "What type of shoes?" For other products, use a single direct question like "What size?" or "Which color?"' : ''}
`;

    // Create a completion using our safe Anthropic wrapper
    const response = await createSafeCompletion({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        { role: "user", content: query as string }
      ]
    });

    // Get relevant image if in shopping mode
    let imageUrl;
    if (type === 'shopping' && relatedContent.length > 0) {
      const firstProduct = relatedContent[0];
      imageUrl = firstProduct.imageUrl || null;
    }

    // Extract text from Anthropic response
    const responseText = response.content && response.content.length > 0
      ? response.content[0].text
      : 'I apologize, but I was unable to process your request. Please try again.';

    // For shopping queries, handle special cases directly and clean up other responses
    let finalText = responseText;

    if (type === 'shopping') {
      // Hard-coded response for shoe queries
      if (query.toString().toLowerCase().includes('shoe') ||
          query.toString().toLowerCase().includes('looking for shoe')) {
        finalText = "What type of shoes?";
      } else {
        // For other queries, clean up responses
        finalText = responseText
          .replace(/\$\d+(\.\d+)?/g, '[price]') // Remove specific prices
          .replace(/(Daswos|Ergonomic) (Leather|Mesh|Accent|Executive) (Chair|Office Chair)/gi, 'chair') // Remove specific product names
          .replace(/^(I can help you with that\.|Sure,|Okay,|Great!|Let me help you|I'd be happy to help)/, '') // Remove common introductory phrases
          .replace(/^\s+/, '') // Remove leading whitespace
          .replace(/\.+$/, '?') // Replace ending periods with question mark
      }
    }

    // For shopping queries, don't include related items as they'll be shown in main results
    return {
      text: finalText,
      hasAudio: true,
      imageUrl: type === 'information' ? imageUrl : null,
      relatedItems: type === 'information' ? relatedContent.slice(0, 5) : [] // Only include related items for information queries
    };
  } catch (error) {
    console.error('Error generating AI response:', error);

    // Return a graceful error response instead of throwing
    return {
      text: 'I apologize, but I encountered an issue processing your request. Please try again later.',
      hasAudio: false
    };
  }
}

/**
 * Extract potential product keywords from a user query
 * This helps in finding relevant products even when the query is in natural language
 */
async function extractProductKeywords(query: string): Promise<string[]> {
  // Normalize query: convert to lowercase and remove punctuation
  const normalizedQuery = query.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

  // Common product nouns and shopping-related terms that might appear in queries
  const commonProductTerms = [
    'chair', 'chairs', 'table', 'tables', 'desk', 'desks', 'sofa', 'sofas', 'couch', 'couches',
    'bed', 'beds', 'mattress', 'mattresses', 'lamp', 'lamps', 'light', 'lights',
    'computer', 'computers', 'laptop', 'laptops', 'phone', 'phones', 'smartphone', 'smartphones',
    'tv', 'tvs', 'television', 'televisions', 'monitor', 'monitors', 'speaker', 'speakers',
    'camera', 'cameras', 'watch', 'watches', 'tablet', 'tablets', 'headphone', 'headphones',
    'book', 'books', 'shoes', 'shoe', 'shirt', 'shirts', 'pants', 'jacket', 'jackets',
    'dress', 'dresses', 'hat', 'hats', 'scarf', 'scarves', 'glove', 'gloves',
    'bag', 'bags', 'backpack', 'backpacks', 'wallet', 'wallets', 'purse', 'purses',
    'necklace', 'necklaces', 'ring', 'rings', 'earring', 'earrings', 'bracelet', 'bracelets',
    'house', 'houses', 'home', 'homes', 'apartment', 'apartments', 'condo', 'condos'
  ];

  // Initialize array for keywords found in the query
  const keywords: string[] = [];

  // First, add the original query without any stopwords for exact product name matching
  keywords.push(normalizedQuery);

  // Split the query into words and add single keywords found in the common products list
  const words = normalizedQuery.split(/\s+/);

  // Extract individual product terms
  for (const word of words) {
    if (commonProductTerms.includes(word) && !keywords.includes(word)) {
      keywords.push(word);
    }
  }

  // Look for 2-word combinations (e.g., "office chair", "dining table")
  for (let i = 0; i < words.length - 1; i++) {
    const twoWordTerm = `${words[i]} ${words[i + 1]}`;
    if (!keywords.includes(twoWordTerm)) {
      keywords.push(twoWordTerm);
    }
  }

  // Add common variants/associations based on the query
  // For example, if "buy chair" is in the query, we might want to add just "chair"
  const buyKeywords = ['buy', 'purchase', 'get', 'find', 'looking for', 'need'];
  for (const buyKeyword of buyKeywords) {
    if (normalizedQuery.includes(buyKeyword)) {
      for (const productTerm of commonProductTerms) {
        if (normalizedQuery.includes(productTerm) && !keywords.includes(productTerm)) {
          keywords.push(productTerm);
        }
      }
      break;
    }
  }

  return keywords;
}

/**
 * Check if a keyword is related to gambling content
 */
function isGamblingRelated(keyword: string): boolean {
  const gamblingKeywords = [
    'gambling', 'casino', 'poker', 'betting', 'lottery', 'slot', 'roulette',
    'blackjack', 'baccarat', 'craps', 'keno', 'bingo', 'sportsbook', 'wager',
    'bookmaker', 'odds', 'jackpot'
  ];

  return gamblingKeywords.some(gamblingKeyword =>
    keyword.toLowerCase().includes(gamblingKeyword)
  );
}

/**
 * Check if a keyword is related to adult content
 */
function isAdultContentRelated(keyword: string): boolean {
  const adultKeywords = [
    'adult', 'mature', 'xxx', 'nsfw', 'explicit', 'erotic', 'porn',
    'sex', 'nude', 'naked', 'escort', 'stripper', 'fetish', 'kinky'
  ];

  return adultKeywords.some(adultKeyword =>
    keyword.toLowerCase().includes(adultKeyword)
  );
}

function formatRelatedContentForPrompt(content: any[], type: string): string {
  if (!content || content.length === 0) {
    return '';
  }

  if (type === 'information') {
    return content.slice(0, 3).map((item, index) => {
      return `Item ${index + 1}: ${item.title}
Summary: ${item.summary || 'No summary available'}
Content: ${item.content.slice(0, 200)}...
Category: ${item.category}
ID: ${item.id}`;
    }).join('\n\n');
  } else {
    // Shopping type
    return content.slice(0, 3).map((item, index) => {
      return `Product ${index + 1}: ${item.title}
Description: ${item.description.slice(0, 150)}...
Price: $${item.price}
Seller: ${item.sellerName}
ID: ${item.id}`;
    }).join('\n\n');
  }
}