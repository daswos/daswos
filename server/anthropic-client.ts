import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// Check if Anthropic API key is available
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('ANTHROPIC_API_KEY is not defined in environment variables. Anthropic features will not work.');
}

// Initialize the Anthropic client using the API key from environment variables
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key', // Use a dummy key to prevent crashes on initialization
});

// Function to check if the Anthropic API key is valid and working
export async function checkAnthropicApiKey(): Promise<boolean> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not defined in environment variables');
      return false;
    }

    // Simple test query to verify the API key works
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      system: 'You are a helpful assistant.',
      messages: [{ role: 'user', content: 'Hello, this is a test.' }]
    });

    console.log('Anthropic API key is valid and working');
    return !!response;
  } catch (error) {
    console.error('Error checking Anthropic API key:', error);
    return false;
  }
}

// Utility function to call Anthropic safely
export async function createSafeCompletion(options: any): Promise<any> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not defined in environment variables');
    }
    
    return await anthropic.messages.create(options);
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    
    // Return a graceful error response
    return {
      content: [
        {
          text: 'I apologize, but I encountered an issue accessing the Anthropic service. Please try again later.'
        }
      ]
    };
  }
}