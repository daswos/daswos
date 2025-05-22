import { Storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';

// AutoShop service to handle background item selection
export class AutoShopService {
  private storage: Storage;
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized: boolean = false;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  // Initialize the service by checking for active AutoShop sessions
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('Initializing AutoShop service...');

      // Get all app settings to find active AutoShop sessions
      const allSettings = await this.storage.getAllAppSettings();

      // Find all active AutoShop sessions
      for (const [key, value] of Object.entries(allSettings)) {
        if (key.startsWith('autoshop_status_') && value?.active) {
          const userId = key.replace('autoshop_status_', '');
          console.log(`Found active AutoShop session for user ${userId}`);

          // Start the timer for this user
          this.startAutoShopTimer(userId);
        }
      }

      this.isInitialized = true;
      console.log('AutoShop service initialized');
    } catch (error) {
      console.error('Error initializing AutoShop service:', error);
    }
  }

  // Start AutoShop for a user
  async startAutoShop(userId: string | number) {
    try {
      const userIdStr = userId.toString();

      // Get AutoShop settings for this user
      const settings = await this.storage.getAutoShopSettings(userIdStr);
      if (!settings) {
        console.error(`No AutoShop settings found for user ${userIdStr}`);
        return false;
      }

      // Start the timer for this user
      this.startAutoShopTimer(userIdStr);

      return true;
    } catch (error) {
      console.error(`Error starting AutoShop for user ${userId}:`, error);
      return false;
    }
  }

  // Stop AutoShop for a user
  async stopAutoShop(userId: string | number) {
    try {
      const userIdStr = userId.toString();

      // Clear the timer for this user
      this.clearAutoShopTimer(userIdStr);

      return true;
    } catch (error) {
      console.error(`Error stopping AutoShop for user ${userId}:`, error);
      return false;
    }
  }

  // Start the AutoShop timer for a user
  private async startAutoShopTimer(userId: string) {
    try {
      // Clear any existing timer
      this.clearAutoShopTimer(userId);

      // Get AutoShop settings for this user
      const settings = await this.storage.getAutoShopSettings(userId);
      if (!settings) {
        console.error(`No AutoShop settings found for user ${userId}`);
        return;
      }

      // Get AutoShop status for this user
      const status = await this.storage.getAutoShopStatus(userId);
      if (!status?.active) {
        console.error(`AutoShop is not active for user ${userId}`);
        return;
      }

      // Calculate interval in milliseconds (convert items per minute to milliseconds between items)
      const itemsPerMinute = settings.itemsPerMinute || 1;
      const intervalMs = 60000 / itemsPerMinute;

      console.log(`Starting AutoShop timer for user ${userId} with interval ${intervalMs}ms (${itemsPerMinute} items per minute)`);

      // Create a timer to select items
      const timer = setInterval(async () => {
        await this.selectItem(userId, settings);
      }, intervalMs);

      // Store the timer
      this.activeTimers.set(userId, timer);

      // Also select an item immediately
      await this.selectItem(userId, settings);
    } catch (error) {
      console.error(`Error starting AutoShop timer for user ${userId}:`, error);
    }
  }

  // Clear the AutoShop timer for a user
  private clearAutoShopTimer(userId: string) {
    const timer = this.activeTimers.get(userId);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(userId);
      console.log(`Cleared AutoShop timer for user ${userId}`);
    }
  }

  // Select an item for a user
  private async selectItem(userId: string, settings: any) {
    try {
      // Check if AutoShop is still active
      const status = await this.storage.getAutoShopStatus(userId);
      if (!status?.active) {
        this.clearAutoShopTimer(userId);
        return;
      }

      // Get current pending items
      const pendingItems = await this.storage.getAutoShopPendingItems(userId);

      // Check if we've reached the maximum number of items
      const maxItems = settings.maxItems || 10;
      if (pendingItems.length >= maxItems) {
        console.log(`Maximum number of items (${maxItems}) reached for user ${userId}`);
        return;
      }

      // Get user's purchase history and search history
      let userIdNum = parseInt(userId);
      let purchaseHistory: any[] = [];
      let searchHistory: any[] = [];

      if (!isNaN(userIdNum)) {
        purchaseHistory = await this.storage.getUserPurchaseHistory(userIdNum, 10);
        searchHistory = await this.storage.getUserSearchHistory(userIdNum, 10);
      }

      // Generate a product recommendation
      let products: any[] = [];

      if (settings.useRandomMode) {
        // Random mode - get random products
        products = await this.storage.getProducts(
          settings.useSafeSphere ? 'safesphere' : 'opensphere',
          '',
          []
        );
      } else if (settings.categories && settings.categories.length > 0) {
        // Category mode - get products from selected categories
        const categoryProducts = await Promise.all(
          settings.categories.map((category: string) =>
            this.storage.getProductsByCategory(category)
          )
        );

        // Flatten the array of arrays
        products = categoryProducts.flat();
      } else {
        // Default - get all products
        products = await this.storage.getProducts(
          settings.useSafeSphere ? 'safesphere' : 'opensphere',
          '',
          []
        );
      }

      // Filter products by price range
      const minPrice = settings.minItemPrice || 0;
      const maxPrice = settings.maxItemPrice || 100000;

      products = products.filter(product => {
        const price = product.price || 0;
        return price >= minPrice && price <= maxPrice;
      });

      // Shuffle the products to get a random one
      products = this.shuffleArray(products);

      // Select a product
      if (products.length > 0) {
        const selectedProduct = products[0];

        // Create an item object
        const item = {
          id: uuidv4(),
          name: selectedProduct.title,
          description: selectedProduct.description,
          category: selectedProduct.category,
          estimatedPrice: selectedProduct.price,
          imageUrl: selectedProduct.imageUrl,
          addedAt: new Date().toISOString(),
          productId: selectedProduct.id
        };

        // Add the item to pending items
        await this.storage.addAutoShopItem(userId, item);

        // Invalidate any cache for this user's pending items
        // This is a bit of a hack since we don't have direct access to the cache
        // But it ensures that the next API call will get fresh data
        try {
          // Try to access the pendingItemsCache from the global scope
          if ((global as any).pendingItemsCache && (global as any).pendingItemsCache.delete) {
            (global as any).pendingItemsCache.delete(userId);
          }
        } catch (cacheError) {
          // Ignore cache invalidation errors
          console.log(`Could not invalidate cache for user ${userId}`);
        }

        console.log(`Selected item "${item.name}" for user ${userId}`);
      } else {
        console.log(`No products found for user ${userId} with the current settings`);
      }
    } catch (error) {
      console.error(`Error selecting item for user ${userId}:`, error);
    }
  }

  // Shuffle an array using Fisher-Yates algorithm
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}
