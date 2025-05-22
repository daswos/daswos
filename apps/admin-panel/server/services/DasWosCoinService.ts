import { db } from '../db';
import { eq, or, and, desc } from 'drizzle-orm';
import { 
  daswosWallets, 
  daswosTransactions, 
  daswosCoinsSupply,
  TransactionType,
  DaswosTransaction
} from '../../shared/daswos-coins-schema';

// Constants
const DASWOS_AI_USER_ID = 0;

class DasWosCoinService {
  /**
   * Get a user's coin balance
   * @param {number} userId - The user ID
   * @returns {Promise<number>} - The user's coin balance
   */
  static async getUserBalance(userId: number): Promise<number> {
    // Get the wallet or create it if it doesn't exist
    const wallet = await db.query.daswosWallets.findFirst({
      where: eq(daswosWallets.userId, userId)
    });
    
    if (!wallet) {
      // Create a new wallet
      await db.insert(daswosWallets).values({
        userId,
        balance: 0,
        lastUpdated: new Date()
      });
      
      return 0;
    }
    
    return Number(wallet.balance);
  }

  /**
   * Purchase coins from the DASWOS AI
   * @param {number} userId - The user ID
   * @param {number} amount - The amount of coins to purchase
   * @param {string} stripePaymentId - The Stripe payment ID
   * @returns {Promise<DaswosTransaction>} - The transaction details
   */
  static async purchaseCoins(userId: number, amount: number, stripePaymentId: string): Promise<DaswosTransaction> {
    return await db.transaction(async (tx) => {
      // Get or create the user's wallet
      let userWallet = await tx.query.daswosWallets.findFirst({
        where: eq(daswosWallets.userId, userId)
      });
      
      if (!userWallet) {
        await tx.insert(daswosWallets).values({
          userId,
          balance: 0,
          lastUpdated: new Date()
        });
        
        userWallet = { userId, balance: 0, lastUpdated: new Date() };
      }
      
      // Get the DASWOS AI wallet
      const aiWallet = await tx.query.daswosWallets.findFirst({
        where: eq(daswosWallets.userId, DASWOS_AI_USER_ID)
      });
      
      if (!aiWallet) {
        throw new Error('DASWOS AI wallet not found');
      }
      
      // Check if the AI has enough coins
      if (Number(aiWallet.balance) < amount) {
        throw new Error('Not enough coins available for purchase');
      }
      
      // Update the balances
      await tx.update(daswosWallets)
        .set({ 
          balance: Number(aiWallet.balance) - amount,
          lastUpdated: new Date()
        })
        .where(eq(daswosWallets.userId, DASWOS_AI_USER_ID));
      
      await tx.update(daswosWallets)
        .set({ 
          balance: Number(userWallet.balance) + amount,
          lastUpdated: new Date()
        })
        .where(eq(daswosWallets.userId, userId));
      
      // Create the transaction record
      const [transaction] = await tx.insert(daswosTransactions)
        .values({
          fromUserId: DASWOS_AI_USER_ID,
          toUserId: userId,
          amount,
          transactionType: TransactionType.PURCHASE,
          timestamp: new Date(),
          referenceId: stripePaymentId,
          description: 'Purchase via Stripe'
        })
        .returning();
      
      return transaction;
    });
  }

  /**
   * Give coins to a user (from the DASWOS AI)
   * @param {number} userId - The user ID
   * @param {number} amount - The amount of coins to give
   * @param {string} reason - The reason for the giveaway
   * @returns {Promise<DaswosTransaction>} - The transaction details
   */
  static async giveCoins(userId: number, amount: number, reason = 'Giveaway'): Promise<DaswosTransaction> {
    return await db.transaction(async (tx) => {
      // Get or create the user's wallet
      let userWallet = await tx.query.daswosWallets.findFirst({
        where: eq(daswosWallets.userId, userId)
      });
      
      if (!userWallet) {
        await tx.insert(daswosWallets).values({
          userId,
          balance: 0,
          lastUpdated: new Date()
        });
        
        userWallet = { userId, balance: 0, lastUpdated: new Date() };
      }
      
      // Get the DASWOS AI wallet
      const aiWallet = await tx.query.daswosWallets.findFirst({
        where: eq(daswosWallets.userId, DASWOS_AI_USER_ID)
      });
      
      if (!aiWallet) {
        throw new Error('DASWOS AI wallet not found');
      }
      
      // Check if the AI has enough coins
      if (Number(aiWallet.balance) < amount) {
        throw new Error('Not enough coins available for giveaway');
      }
      
      // Update the balances
      await tx.update(daswosWallets)
        .set({ 
          balance: Number(aiWallet.balance) - amount,
          lastUpdated: new Date()
        })
        .where(eq(daswosWallets.userId, DASWOS_AI_USER_ID));
      
      await tx.update(daswosWallets)
        .set({ 
          balance: Number(userWallet.balance) + amount,
          lastUpdated: new Date()
        })
        .where(eq(daswosWallets.userId, userId));
      
      // Create the transaction record
      const [transaction] = await tx.insert(daswosTransactions)
        .values({
          fromUserId: DASWOS_AI_USER_ID,
          toUserId: userId,
          amount,
          transactionType: TransactionType.GIVEAWAY,
          timestamp: new Date(),
          referenceId: null,
          description: reason
        })
        .returning();
      
      return transaction;
    });
  }

  /**
   * Transfer coins between users
   * @param {number} fromUserId - The sender's user ID
   * @param {number} toUserId - The recipient's user ID
   * @param {number} amount - The amount of coins to transfer
   * @param {string} description - The description of the transfer
   * @returns {Promise<DaswosTransaction>} - The transaction details
   */
  static async transferCoins(
    fromUserId: number, 
    toUserId: number, 
    amount: number, 
    description = 'User transfer'
  ): Promise<DaswosTransaction> {
    return await db.transaction(async (tx) => {
      // Get the sender's wallet
      const fromWallet = await tx.query.daswosWallets.findFirst({
        where: eq(daswosWallets.userId, fromUserId)
      });
      
      if (!fromWallet) {
        throw new Error('Sender wallet not found');
      }
      
      // Check if the sender has enough coins
      if (Number(fromWallet.balance) < amount) {
        throw new Error('Insufficient balance');
      }
      
      // Get or create the recipient's wallet
      let toWallet = await tx.query.daswosWallets.findFirst({
        where: eq(daswosWallets.userId, toUserId)
      });
      
      if (!toWallet) {
        await tx.insert(daswosWallets).values({
          userId: toUserId,
          balance: 0,
          lastUpdated: new Date()
        });
        
        toWallet = { userId: toUserId, balance: 0, lastUpdated: new Date() };
      }
      
      // Update the balances
      await tx.update(daswosWallets)
        .set({ 
          balance: Number(fromWallet.balance) - amount,
          lastUpdated: new Date()
        })
        .where(eq(daswosWallets.userId, fromUserId));
      
      await tx.update(daswosWallets)
        .set({ 
          balance: Number(toWallet.balance) + amount,
          lastUpdated: new Date()
        })
        .where(eq(daswosWallets.userId, toUserId));
      
      // Create the transaction record
      const [transaction] = await tx.insert(daswosTransactions)
        .values({
          fromUserId,
          toUserId,
          amount,
          transactionType: TransactionType.TRANSFER,
          timestamp: new Date(),
          referenceId: null,
          description
        })
        .returning();
      
      return transaction;
    });
  }

  /**
   * Get the total supply of DasWos coins
   * @returns {Promise<{total: number, minted: number}>} - The total supply information
   */
  static async getTotalSupply(): Promise<{total: number, minted: number}> {
    const supply = await db.query.daswosCoinsSupply.findFirst();
    
    if (!supply) {
      return { total: 0, minted: 0 };
    }
    
    return { 
      total: Number(supply.totalAmount), 
      minted: Number(supply.mintedAmount) 
    };
  }

  /**
   * Get a user's transaction history
   * @param {number} userId - The user ID
   * @param {number} limit - The maximum number of transactions to return
   * @param {number} offset - The offset for pagination
   * @returns {Promise<DaswosTransaction[]>} - The transaction history
   */
  static async getUserTransactionHistory(
    userId: number, 
    limit = 10, 
    offset = 0
  ): Promise<DaswosTransaction[]> {
    return await db.query.daswosTransactions.findMany({
      where: or(
        eq(daswosTransactions.fromUserId, userId),
        eq(daswosTransactions.toUserId, userId)
      ),
      orderBy: desc(daswosTransactions.timestamp),
      limit,
      offset
    });
  }
}

export default DasWosCoinService;
