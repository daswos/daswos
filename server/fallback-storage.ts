import { IStorage } from "./storage";
import { 
  InsertProduct, 
  InsertUser, 
  Product, 
  User,
  InsertSearchQuery,
  SearchQuery,
  InformationContent,
  DaswosAiChat,
  DaswosAiChatMessage
} from "@shared/schema";

// In-memory storage for testing and development
export class FallbackStorage implements IStorage {
  private users: User[] = [];
  private products: Product[] = [];
  private searchQueries: SearchQuery[] = [];
  private informationContent: InformationContent[] = [];
  private daswosAiChats: DaswosAiChat[] = [];
  private daswosAiChatMessages: DaswosAiChatMessage[] = [];
  private appSettings: {key: string, value: any}[] = [];
  
  // Full implementation of IStorage required properties
  sessionStore: any = null;
  private nextUserId = 1;
  private nextProductId = 1;
  private nextSearchQueryId = 1;
  private nextInformationContentId = 1;
  private nextDaswosAiChatId = 1;
  private nextDaswosAiChatMessageId = 1;

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id) || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username) || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email) || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const now = new Date();
    const newUser: User = {
      id,
      ...user,
      createdAt: now,
      isSeller: false,
      isAdmin: false,
      avatar: null,
      hasSubscription: false,
      subscriptionType: null,
      subscriptionExpiresAt: null,
      isFamilyOwner: false,
      parentAccountId: null,
      isChildAccount: false,
      superSafeMode: false,
      superSafeSettings: {
        blockGambling: true,
        blockAdultContent: true,
        blockOpenSphere: false
      },
      safeSphereActive: false,
      aiShopperEnabled: false,
      aiShopperSettings: {
        autoPurchase: false,
        autoPaymentEnabled: false,
        confidenceThreshold: 0.85,
        budgetLimit: 5000,
        maxTransactionLimit: 10000,
        preferredCategories: [],
        avoidTags: [],
        minimumTrustScore: 85,
        purchaseMode: "refined",
        maxPricePerItem: 5000,
        maxCoinsPerItem: 50,
        maxCoinsPerDay: 100,
        maxCoinsOverall: 1000
      },
      dasWosCoins: 0
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUserSubscription(userId: number, type: string, durationMonths: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);
    
    const hasSubscription = type !== "";
    
    user.subscriptionType = type;
    user.subscriptionExpiresAt = hasSubscription ? expiresAt : null;
    user.hasSubscription = hasSubscription;
    
    return user;
  }

  async checkUserHasSubscription(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    // Check if user has active subscription
    if (!user.hasSubscription) return false;
    
    // Check if subscription has expired
    if (user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) {
      // Subscription has expired, update the user record
      user.hasSubscription = false;
      user.subscriptionType = null;
      user.subscriptionExpiresAt = null;
      
      return false;
    }
    
    return true;
  }

  async getUserSubscriptionDetails(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    return {
      hasSubscription: user.hasSubscription,
      type: user.subscriptionType,
      expiresAt: user.subscriptionExpiresAt
    };
  }

  // Product methods
  async getProducts(sphere: string = "safesphere", query: string = ""): Promise<Product[]> {
    // Convert query to lowercase for case-insensitive search
    const searchQuery = query.toLowerCase();
    
    // Filter products by sphere
    let filteredProducts = this.products;
    
    if (sphere.startsWith('bulkbuy')) {
      // Special handling for bulkbuy spheres
      filteredProducts = filteredProducts.filter(product => product.isBulkBuy);
      
      // Apply additional sphere filter (safe/open)
      if (sphere === 'bulkbuy-safe') {
        filteredProducts = filteredProducts.filter(product => product.trustScore >= 80);
      }
    } else if (sphere === 'safesphere') {
      filteredProducts = filteredProducts.filter(product => product.trustScore >= 80);
    }
    
    // Apply search query if provided
    if (searchQuery) {
      filteredProducts = filteredProducts.filter(product => 
        product.title.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }
    
    // Sort by trust score descending
    return filteredProducts.sort((a, b) => b.trustScore - a.trustScore);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.find(product => product.id === id) || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.nextProductId++;
    const now = new Date();
    const newProduct: Product = {
      id,
      createdAt: now,
      ...product,
      originalPrice: null,
      discount: null,
      verifiedSince: null,
      imageDescription: null
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async getProductsBySellerId(sellerId: number): Promise<Product[]> {
    return this.products.filter(product => product.sellerId === sellerId);
  }

  async getRelatedProducts(tags: string[], excludeId: number): Promise<Product[]> {
    // Find products with similar tags, excluding the current product
    return this.products
      .filter(product => 
        product.id !== excludeId && 
        product.tags.some(tag => tags.includes(tag))
      )
      .sort((a, b) => {
        // Sort by the number of matching tags
        const aMatchCount = a.tags.filter(tag => tags.includes(tag)).length;
        const bMatchCount = b.tags.filter(tag => tags.includes(tag)).length;
        return bMatchCount - aMatchCount;
      })
      .slice(0, 5);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    // Find products in the specified category
    return this.products
      .filter(product => product.tags.includes(category))
      .slice(0, 10);
  }

  // Search Query methods
  async saveSearchQuery(query: InsertSearchQuery): Promise<SelectSearchQuery> {
    const id = this.nextSearchQueryId++;
    const newQuery: SelectSearchQuery = {
      id,
      ...query,
      filters: query.filters || null
    };
    this.searchQueries.push(newQuery);
    return newQuery;
  }

  async getRecentSearches(limit: number = 5): Promise<SelectSearchQuery[]> {
    return [...this.searchQueries]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Information Content methods
  async getInformationContent(query: string = "", limit?: number): Promise<SelectInformationContent[]> {
    // Convert query to lowercase for case-insensitive search
    const searchQuery = query.toLowerCase();
    
    let filteredContent = this.informationContent;
    
    // Apply search query if provided
    if (searchQuery) {
      filteredContent = filteredContent.filter(content => 
        content.title.toLowerCase().includes(searchQuery) ||
        content.content.toLowerCase().includes(searchQuery) ||
        content.summary.toLowerCase().includes(searchQuery) ||
        content.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }
    
    // Apply limit if provided
    if (limit) {
      filteredContent = filteredContent.slice(0, limit);
    }
    
    return filteredContent;
  }

  async getInformationContentById(id: number): Promise<SelectInformationContent | null> {
    return this.informationContent.find(content => content.id === id) || null;
  }

  async getInformationContentByCategory(category: string): Promise<SelectInformationContent[]> {
    return this.informationContent.filter(content => content.category === category);
  }

  // Seller verification methods
  async createSellerVerification(data: any): Promise<any> {
    // Just return the data with an ID for now
    return { id: Date.now(), ...data };
  }

  async getSellerVerificationsByUserId(userId: number): Promise<any[]> {
    // Return an empty array for now
    return [];
  }

  async updateSellerVerificationStatus(id: number, status: string, comments?: string): Promise<any> {
    // Return mock data
    return { id, status, comments };
  }

  // Daswos AI Chat methods
  async createDaswosAiChat(chatData: InsertDaswosAiChat): Promise<DaswosAiChat> {
    const id = this.nextDaswosAiChatId++;
    const now = new Date();
    const newChat: DaswosAiChat = {
      id,
      userId: chatData.userId,
      title: chatData.title,
      isArchived: false,
      createdAt: now,
      updatedAt: null
    };
    this.daswosAiChats.push(newChat);
    return newChat;
  }

  async getUserChats(userId: number | null): Promise<DaswosAiChat[]> {
    return this.daswosAiChats
      .filter(chat => chat.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getChatById(chatId: number): Promise<DaswosAiChat | undefined> {
    return this.daswosAiChats.find(chat => chat.id === chatId);
  }

  async updateChatTitle(chatId: number, title: string): Promise<DaswosAiChat> {
    const chat = this.daswosAiChats.find(chat => chat.id === chatId);
    if (!chat) throw new Error("Chat not found");

    chat.title = title;
    chat.updatedAt = new Date();
    return chat;
  }

  async archiveChat(chatId: number): Promise<DaswosAiChat> {
    const chat = this.daswosAiChats.find(chat => chat.id === chatId);
    if (!chat) throw new Error("Chat not found");

    chat.isArchived = true;
    chat.updatedAt = new Date();
    return chat;
  }

  async addChatMessage(messageData: InsertDaswosAiChatMessage): Promise<DaswosAiChatMessage> {
    const id = this.nextDaswosAiChatMessageId++;
    const now = new Date();
    const newMessage: DaswosAiChatMessage = {
      id,
      chatId: messageData.chatId,
      content: messageData.content,
      role: messageData.role,
      timestamp: now,
      metadata: messageData.metadata || {}
    };
    this.daswosAiChatMessages.push(newMessage);
    return newMessage;
  }

  async getChatMessages(chatId: number): Promise<DaswosAiChatMessage[]> {
    return this.daswosAiChatMessages
      .filter(msg => msg.chatId === chatId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getRecentChatMessage(chatId: number): Promise<DaswosAiChatMessage | undefined> {
    const messages = this.daswosAiChatMessages
      .filter(msg => msg.chatId === chatId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return messages.length > 0 ? messages[0] : undefined;
  }
  
  async addMessageSource(sourceData: InsertDaswosAiSource): Promise<DaswosAiSource> {
    return {
      id: Date.now(),
      messageId: sourceData.messageId,
      type: sourceData.type,
      content: sourceData.content,
      metadata: sourceData.metadata || {},
      timestamp: new Date()
    };
  }
  
  async getMessageSources(messageId: number): Promise<DaswosAiSource[]> {
    return [];
  }
  
  // App settings operations
  async getAppSettings(key: string): Promise<any> {
    const setting = this.appSettings.find(s => s.key === key);
    return setting ? setting.value : null;
  }
  
  async setAppSettings(key: string, value: any): Promise<boolean> {
    try {
      const existingIndex = this.appSettings.findIndex(s => s.key === key);
      
      if (existingIndex >= 0) {
        // Update existing setting
        this.appSettings[existingIndex].value = value;
      } else {
        // Create new setting
        this.appSettings.push({
          key,
          value
        });
      }
      
      return true;
    } catch (error) {
      console.error(`Error setting app setting ${key}:`, error);
      return false;
    }
  }
  
  async getAllAppSettings(): Promise<{[key: string]: any}> {
    return this.appSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as {[key: string]: any});
  }
}