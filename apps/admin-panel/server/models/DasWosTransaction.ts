import { Model } from 'objection';
import knex from '../db/knex';
import DasWosWallet from './DasWosWallet';

Model.knex(knex);

class DasWosTransaction extends Model {
  static get tableName() {
    return 'daswos_transactions';
  }

  static get idColumn() {
    return 'transaction_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['from_user_id', 'to_user_id', 'amount', 'transaction_type'],
      properties: {
        transaction_id: { type: 'integer' },
        from_user_id: { type: 'integer' },
        to_user_id: { type: 'integer' },
        amount: { type: ['number', 'string'] },
        transaction_type: { type: 'string', enum: ['purchase', 'giveaway', 'transfer'] },
        timestamp: { type: 'string', format: 'date-time' },
        reference_id: { type: ['string', 'null'] },
        description: { type: ['string', 'null'] }
      }
    };
  }

  static get relationMappings() {
    return {
      fromUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./User').default,
        join: {
          from: 'daswos_transactions.from_user_id',
          to: 'users.id'
        }
      },
      toUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./User').default,
        join: {
          from: 'daswos_transactions.to_user_id',
          to: 'users.id'
        }
      }
    };
  }

  // Create a new transaction and update wallet balances
  static async createTransaction(
    fromUserId: number, 
    toUserId: number, 
    amount: number, 
    type: string, 
    referenceId: string | null = null, 
    description: string | null = null
  ) {
    // Start a transaction to ensure atomicity
    const trx = await Model.startTransaction();
    
    try {
      // Get the wallets
      const fromWallet = await DasWosWallet.query(trx).findById(fromUserId);
      const toWallet = await DasWosWallet.query(trx).findById(toUserId);
      
      // Check if the sender has enough coins
      if (fromWallet.balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      // Update the balances
      await DasWosWallet.query(trx)
        .findById(fromUserId)
        .patch({
          balance: Number(fromWallet.balance) - Number(amount),
          last_updated: new Date()
        });
      
      await DasWosWallet.query(trx)
        .findById(toUserId)
        .patch({
          balance: Number(toWallet.balance) + Number(amount),
          last_updated: new Date()
        });
      
      // Create the transaction record
      const transaction = await this.query(trx).insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount: amount,
        transaction_type: type,
        reference_id: referenceId,
        description: description
      });
      
      // Commit the transaction
      await trx.commit();
      
      return transaction;
    } catch (error) {
      // Rollback the transaction in case of error
      await trx.rollback();
      throw error;
    }
  }

  // Get transactions for a user
  static async getUserTransactions(userId: number, limit = 10, offset = 0) {
    return await this.query()
      .where('from_user_id', userId)
      .orWhere('to_user_id', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset);
  }
}

export default DasWosTransaction;
