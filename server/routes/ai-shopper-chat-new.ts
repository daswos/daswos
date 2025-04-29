import { Router, Express } from 'express';

export function setupAiShopperChatRoutes(app: Express): void {
  const router = Router();

  // Get chat history
  router.get('/history', async (req, res) => {
    try {
      res.json({ history: [] });
    } catch (error) {
      console.error('Error getting chat history:', error);
      res.status(500).json({ error: 'Failed to retrieve chat history' });
    }
  });

  // Send message to AI Shopper
  router.post('/message', async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      res.json({
        id: Date.now(),
        message: "AI Shopper is not available at the moment.",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  // Register the router
  app.use('/api/ai-shopper-chat', router);
}