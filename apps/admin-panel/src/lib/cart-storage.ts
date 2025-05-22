import { Product } from '@shared/schema';

// Define cart item type
export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  source: string;
  description?: string;
  createdAt: string;
  recommendationId?: number;
}

// Local storage key for cart
const CART_STORAGE_KEY = 'daswos_cart';

/**
 * Get cart items from local storage
 */
export function getLocalCartItems(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error getting cart from local storage:', error);
    return [];
  }
}

/**
 * Save cart items to local storage
 */
export function saveLocalCartItems(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to local storage:', error);
  }
}

/**
 * Add item to local cart
 */
export function addItemToLocalCart(product: Product, quantity: number = 1, source: string = 'manual'): CartItem {
  const cartItems = getLocalCartItems();
  
  // Check if product already exists in cart
  const existingItemIndex = cartItems.findIndex(item => item.productId === product.id);
  
  if (existingItemIndex >= 0) {
    // Update quantity if product already exists
    cartItems[existingItemIndex].quantity += quantity;
    saveLocalCartItems(cartItems);
    return cartItems[existingItemIndex];
  } else {
    // Add new item to cart
    const newItem: CartItem = {
      id: Date.now(), // Use timestamp as temporary ID
      productId: product.id,
      name: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity,
      source,
      description: product.description,
      createdAt: new Date().toISOString()
    };
    
    cartItems.push(newItem);
    saveLocalCartItems(cartItems);
    return newItem;
  }
}

/**
 * Remove item from local cart
 */
export function removeItemFromLocalCart(itemId: number): void {
  const cartItems = getLocalCartItems();
  const updatedItems = cartItems.filter(item => item.id !== itemId);
  saveLocalCartItems(updatedItems);
}

/**
 * Update item quantity in local cart
 */
export function updateLocalCartItemQuantity(itemId: number, quantity: number): CartItem | null {
  const cartItems = getLocalCartItems();
  const itemIndex = cartItems.findIndex(item => item.id === itemId);
  
  if (itemIndex >= 0) {
    cartItems[itemIndex].quantity = quantity;
    saveLocalCartItems(cartItems);
    return cartItems[itemIndex];
  }
  
  return null;
}

/**
 * Clear all items from local cart
 */
export function clearLocalCart(): void {
  saveLocalCartItems([]);
}

/**
 * Sync local cart with server cart
 * This merges local cart items with server cart items
 */
export async function syncCartWithServer(): Promise<void> {
  try {
    // Get local cart items
    const localItems = getLocalCartItems();
    
    // If no local items, nothing to sync
    if (localItems.length === 0) return;
    
    // Get server cart items
    const response = await fetch('/api/user/cart', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch server cart');
    }
    
    const serverItems = await response.json();
    
    // Add local items to server cart if they don't exist
    for (const localItem of localItems) {
      const existsOnServer = serverItems.some((serverItem: CartItem) => 
        serverItem.productId === localItem.productId
      );
      
      if (!existsOnServer) {
        // Add to server cart
        await fetch('/api/user/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            productId: localItem.productId,
            quantity: localItem.quantity,
            source: localItem.source
          })
        });
      }
    }
    
    // Clear local cart after successful sync
    clearLocalCart();
  } catch (error) {
    console.error('Error syncing cart with server:', error);
  }
}
