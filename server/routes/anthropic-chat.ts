import { Router, Express } from 'express';

export function setupAnthropicChatRoutes(app: Express): void {
  const router = Router();

  // Get chat history
  router.get('/history', async (req, res) => {
    try {
      res.json({ history: [] });
    } catch (error) {
      console.error('Error getting anthropic chat history:', error);
      res.status(500).json({ error: 'Failed to retrieve chat history' });
    }
  });

  // Send message to Anthropic
  router.post('/message', async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      res.json({
        id: Date.now(),
        message: "Anthropic chat service is not available at the moment.",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending message to anthropic:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  // Register the router
  app.use('/api/anthropic-chat', router);
}