import { IStorage } from './storage';
import memorystore from "memorystore";
import session from "express-session";
import { log } from './vite';

/**
 * FallbackStorage provides an in-memory implementation of the IStorage interface.
 * This is used when the primary database storage is unavailable.
 */
export class FallbackStorage implements IStorage {
  private users: any[] = [];
  private products: any[] = [];
  private informationContent: any[] = [];
  private searchQueries: any[] = [];
  public sessionStore: session.Store;

  constructor() {
    // Initialize a memory store for sessions
    const MemoryStore = memorystore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Initialize with some sample data
    this.initializeSampleData();
    
    log('FallbackStorage initialized with sample data', 'info');
  }

  private initializeSampleData() {
    // Sample users
    this.users = [
      {
        id: 1,
        username: 'demo',
        email: 'demo@example.com',
        password: 'demo123',
        hasSubscription: true,
        subscriptionType: 'unlimited',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isSeller: false,
        isFamilyOwner: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Sample products
    this.products = [
      {
        id: 1,
        name: 'Sample Product 1',
        description: 'This is a sample product for testing',
        price: 1999, // $19.99
        imageUrl: 'https://via.placeholder.com/300',
        category: 'Electronics',
        sellerId: 1,
        trustScore: 90,
        sphere: 'safesphere',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Sample Product 2',
        description: 'Another sample product for testing',
        price: 2999, // $29.99
        imageUrl: 'https://via.placeholder.com/300',
        category: 'Home',
        sellerId: 1,
        trustScore: 85,
        sphere: 'safesphere',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Sample information content
    this.informationContent = [
      {
        id: 1,
        title: 'Sample Information 1',
        content: 'This is sample information content for testing',
        category: 'Technology',
        trustScore: 90,
        sphere: 'safesphere',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        title: 'Sample Information 2',
        content: 'Another sample information content for testing',
        category: 'Health',
        trustScore: 85,
        sphere: 'safesphere',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // User operations
  async getUser(id: number) {
    return this.users.find(user => user.id === id);
  }

  async getUserById(id: number) {
    return this.getUser(id);
  }

  async getUserByUsername(username: string) {
    return this.users.find(user => user.username.toLowerCase() === username.toLowerCase());
  }

  async getUserByEmail(email: string) {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  async createUser(user: any) {
    const newUser = {
      ...user,
      id: this.users.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  // Product operations
  async getProducts(sphere: string, query?: string) {
    let filteredProducts = this.products.filter(product => 
      product.sphere === sphere || sphere === 'all'
    );

    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
      );
    }

    return filteredProducts;
  }

  async getProductById(id: number) {
    return this.products.find(product => product.id === id);
  }

  // Information content operations
  async getInformationContent(query?: string, category?: string) {
    let filteredContent = [...this.informationContent];

    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredContent = filteredContent.filter(content =>
        content.title.toLowerCase().includes(lowerQuery) ||
        content.content.toLowerCase().includes(lowerQuery)
      );
    }

    if (category) {
      filteredContent = filteredContent.filter(content =>
        content.category === category
      );
    }

    return filteredContent;
  }

  // AI search operations
  async generateAiRecommendations(
    userId: number,
    searchQuery?: string,
    isBulkBuy?: boolean,
    searchHistory?: string[],
    shoppingList?: string
  ) {
    // In the fallback storage, we just return a success message
    return {
      success: true,
      message: 'AI recommendations generated successfully (fallback mode)'
    };
  }

  // Implement minimal versions of all required methods
  async updateUserSubscription(userId: number, subscriptionType: string, durationMonths: number) {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);
    
    user.hasSubscription = true;
    user.subscriptionType = subscriptionType;
    user.subscriptionExpiresAt = expiresAt;
    user.updatedAt = new Date();
    
    return user;
  }

  async checkUserHasSubscription(userId: number) {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    return user.hasSubscription && 
           user.subscriptionExpiresAt && 
           new Date() < user.subscriptionExpiresAt;
  }

  async getUserSubscriptionDetails(userId: number) {
    const user = await this.getUser(userId);
    if (!user) return { hasSubscription: false };
    
    return {
      hasSubscription: user.hasSubscription && 
                      user.subscriptionExpiresAt && 
                      new Date() < user.subscriptionExpiresAt,
      type: user.subscriptionType,
      expiresAt: user.subscriptionExpiresAt
    };
  }

  // Stub implementations for all other required methods
  async updateUserSellerStatus() { return true; }
  async createStripeSubscription() { return {} as any; }
  async updateStripeSubscription() { return {} as any; }
  async getStripeSubscription() { return undefined; }
  async createFamilyInvitationCode() { return {} as any; }
  async getFamilyInvitationByCode() { return undefined; }
  async getFamilyInvitationsByOwner() { return []; }
  async markFamilyInvitationAsUsed() { return true; }
  async getFamilyMembers() { return []; }
  async updateFamilyMemberSettings() { return true; }
  async addFamilyMember() { return { success: true, message: 'Not implemented' }; }
  async removeFamilyMember() { return true; }
  async isFamilyOwner() { return false; }
  async createChildAccount() { return { success: false, message: 'Not implemented' }; }
  async updateChildAccountPassword() { return true; }
  async getSuperSafeStatus() { return { enabled: false, settings: {} }; }
  async updateSuperSafeStatus() { return true; }
  async updateFamilyMemberSuperSafeStatus() { return true; }
  async getSafeSphereStatus() { return false; }
  async updateSafeSphereStatus() { return true; }
  async createProduct() { return {} as any; }
  async getProductsBySellerId() { return []; }
  async saveSearchQuery() { return {} as any; }
  async getRecentSearches() { return []; }
  async createSellerVerification() { return {} as any; }
  async getSellerVerificationsByUserId() { return []; }
  async updateSellerVerificationStatus() { return {} as any; }
  async findSellerByUserId() { return undefined; }
  async getSellerById() { return undefined; }
  async getPendingSellerVerifications() { return []; }
  async getAllSellerVerifications() { return []; }
  async createSeller() { return {} as any; }
  async updateSeller() { return {} as any; }
  async createBulkBuyRequest() { return {} as any; }
  async getBulkBuyRequestsByUserId() { return []; }
  async getBulkBuyRequestById() { return undefined; }
  async updateBulkBuyRequestStatus() { return {} as any; }
  async getAiShopperStatus() { return { enabled: false, settings: {} }; }
  async updateAiShopperStatus() { return true; }
  async createAiShopperRecommendation() { return {} as any; }
  async getAiShopperRecommendationsByUserId() { return []; }
  async getRecommendationById() { return null; }
  async updateAiShopperRecommendationStatus() { return {} as any; }
  async clearAiShopperRecommendations() { return; }
  async processAutoPurchase() { return { success: false, message: 'Not implemented' }; }
  async createSplitBuy() { return {} as any; }
  async getSplitBuyById() { return undefined; }
  async getSplitBuysByProductId() { return []; }
  async getSplitBuysByUserId() { return []; }
  async updateSplitBuyStatus() { return {} as any; }
  async addSplitBuyParticipant() { return {} as any; }
  async getSplitBuyParticipants() { return []; }
  async updateSplitBuyParticipantStatus() { return {} as any; }
  async createOrder() { return {} as any; }
  async getOrderById() { return undefined; }
  async getOrdersByUserId() { return []; }
  async updateOrderStatus() { return {} as any; }
  async addOrderItem() { return {} as any; }
  async getOrderItemsByOrderId() { return []; }
  async getUserDasWosCoins() { return 0; }
  async addDasWosCoins() { return true; }
  async spendDasWosCoins() { return true; }
  async getDasWosCoinsTransactions() { return []; }
  async createDaswosAiChat() { return {} as any; }
  async getUserChats() { return []; }
  async getChatById() { return undefined; }
  async updateChatTitle() { return {} as any; }
  async archiveChat() { return {} as any; }
  async addChatMessage() { return {} as any; }
  async getChatMessages() { return []; }
  async getRecentChatMessage() { return undefined; }
  async addMessageSource() { return {} as any; }
  async getMessageSources() { return []; }
  async getUserPaymentMethods() { return []; }
  async getDefaultPaymentMethod() { return undefined; }
  async addUserPaymentMethod() { return {} as any; }
  async setDefaultPaymentMethod() { return true; }
  async deletePaymentMethod() { return true; }
  async getAppSettings() { return {}; }
  async setAppSettings() { return true; }
  async getAllAppSettings() { return {}; }
  async getInformationContentById() { return undefined; }
  async createInformationContent() { return {} as any; }
  async getInformationContentByCategory() { return []; }
  async createCollaborativeSearch() { return {} as any; }
  async getCollaborativeSearchById() { return undefined; }
  async getUserCollaborativeSearches() { return []; }
  async updateCollaborativeSearch() { return {} as any; }
  async searchCollaborativeSearches() { return []; }
  async addResourceToCollaborativeSearch() { return {} as any; }
  async getResourceById() { return undefined; }
  async getResourcesBySearchId() { return []; }
  async updateResource() { return {} as any; }
  async addCollaborator() { return {} as any; }
  async getSearchCollaborators() { return []; }
  async getUserCollaborations() { return []; }
  async removeCollaborator() { return true; }
  async requestResourcePermission() { return {} as any; }
  async getResourcePermissionRequests() { return []; }
  async getUserPermissionRequests() { return []; }
  async updatePermissionRequestStatus() { return {} as any; }
  async getUserCartItems() { return []; }
  async addCartItem() { return {} as any; }
  async updateCartItemQuantity() { return {} as any; }
  async removeCartItem() { return; }
  async clearUserCart() { return; }
  async addAiRecommendationToCart() { return {} as any; }
  async getDasbarSettings() { return {}; }
  async updateDasbarSettings() { return {}; }
  async getUserDasbarPreferences() { return {}; }
  async saveUserDasbarPreferences() { return {}; }
}
