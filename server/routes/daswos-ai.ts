import express from 'express';
import { IStorage } from '../storage';

function createDaswosAiRoutes(storage: IStorage) {
  const router = express.Router();

  // Create a new DaswosAI chat
  router.post('/chats', async (req, res) => {
    try {
      const { userId, title } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      const chat = await storage.createDaswosAiChat({
        userId,
        title,
        isArchived: false
      });
      
      res.json(chat);
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ error: 'Failed to create chat' });
    }
  });

  // Get all chats for a user
  router.get('/chats', async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : null;
      const chats = await storage.getUserChats(userId);
      res.json(chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ error: 'Failed to fetch chats' });
    }
  });

  // Get a specific chat by ID
  router.get('/chats/:chatId', async (req, res) => {
    try {
      const chatId = Number(req.params.chatId);
      const chat = await storage.getChatById(chatId);
      
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      
      res.json(chat);
    } catch (error) {
      console.error('Error fetching chat:', error);
      res.status(500).json({ error: 'Failed to fetch chat' });
    }
  });

  // Archive a chat
  router.post('/chats/:chatId/archive', async (req, res) => {
    try {
      const chatId = Number(req.params.chatId);
      const chat = await storage.archiveChat(chatId);
      res.json(chat);
    } catch (error) {
      console.error('Error archiving chat:', error);
      res.status(500).json({ error: 'Failed to archive chat' });
    }
  });

  // Update chat title
  router.put('/chats/:chatId/title', async (req, res) => {
    try {
      const chatId = Number(req.params.chatId);
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      const chat = await storage.updateChatTitle(chatId, title);
      res.json(chat);
    } catch (error) {
      console.error('Error updating chat title:', error);
      res.status(500).json({ error: 'Failed to update chat title' });
    }
  });

  // Add a message to a chat
  router.post('/chats/:chatId/messages', async (req, res) => {
    try {
      const chatId = Number(req.params.chatId);
      const { content, role, metadata } = req.body;
      
      if (!content || !role) {
        return res.status(400).json({ error: 'Content and role are required' });
      }
      
      const message = await storage.addChatMessage({
        chatId,
        content,
        role,
        metadata: metadata || {}
      });
      
      res.json(message);
    } catch (error) {
      console.error('Error adding message:', error);
      res.status(500).json({ error: 'Failed to add message' });
    }
  });

  // Get all messages for a chat
  router.get('/chats/:chatId/messages', async (req, res) => {
    try {
      const chatId = Number(req.params.chatId);
      const messages = await storage.getChatMessages(chatId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Get the most recent message for a chat
  router.get('/chats/:chatId/messages/recent', async (req, res) => {
    try {
      const chatId = Number(req.params.chatId);
      const message = await storage.getRecentChatMessage(chatId);
      
      if (!message) {
        return res.status(404).json({ error: 'No messages found' });
      }
      
      res.json(message);
    } catch (error) {
      console.error('Error fetching recent message:', error);
      res.status(500).json({ error: 'Failed to fetch recent message' });
    }
  });

  // Add a source to a message
  router.post('/messages/:messageId/sources', async (req, res) => {
    try {
      const messageId = Number(req.params.messageId);
      const { type, content, metadata } = req.body;
      
      if (!type || !content) {
        return res.status(400).json({ error: 'Type and content are required' });
      }
      
      const source = await storage.addMessageSource({
        messageId,
        type,
        content,
        metadata: metadata || {}
      });
      
      res.json(source);
    } catch (error) {
      console.error('Error adding source:', error);
      res.status(500).json({ error: 'Failed to add source' });
    }
  });

  // Get all sources for a message
  router.get('/messages/:messageId/sources', async (req, res) => {
    try {
      const messageId = Number(req.params.messageId);
      const sources = await storage.getMessageSources(messageId);
      res.json(sources);
    } catch (error) {
      console.error('Error fetching sources:', error);
      res.status(500).json({ error: 'Failed to fetch sources' });
    }
  });

  return router;
}

export { createDaswosAiRoutes };