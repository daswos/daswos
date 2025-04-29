import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Check if OpenAI API key is available
if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not defined in environment variables. OpenAI features will not work.');
}

// Initialize the OpenAI client using the API key from environment variables
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key', // Use a dummy key to prevent crashes on initialization
});

// Function to check if the OpenAI API key is valid and working
export async function checkOpenAiApiKey(): Promise<boolean> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not defined in environment variables');
      return false;
    }

    // Simple test query to verify the API key works
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello, this is a test.' }],
      max_tokens: 5
    });

    console.log('OpenAI API key is valid and working');
    return !!response;
  } catch (error) {
    console.error('Error checking OpenAI API key:', error);
    return false;
  }
}

// Utility function to call OpenAI safely
export async function createSafeCompletion(options: any): Promise<any> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    
    return await openai.chat.completions.create(options);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Return a graceful error response
    return {
      choices: [
        {
          message: {
            content: 'I apologize, but I encountered an issue accessing the OpenAI service. Please try again later.'
          }
        }
      ]
    };
  }
}