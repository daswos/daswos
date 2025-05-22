import { Model } from 'objection';
import knex from '../db/knex';
import path from 'path';

Model.knex(knex);

class DasWosWallet extends Model {
  static get tableName() {
    return 'daswos_wallets';
  }

  static get idColumn() {
    return 'user_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'balance'],
      properties: {
        user_id: { type: 'integer' },
        balance: { type: ['number', 'string'] },
        last_updated: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    // Import path for User model
    const userModelPath = path.join(__dirname, 'User');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        // Use a function that returns the model class to avoid circular dependencies
        modelClass: function() {
          return require(userModelPath).default;
        },
        join: {
          from: 'daswos_wallets.user_id',
          to: 'users.id'
        }
      }
    };
  }

  // Get a user's wallet, creating it if it doesn't exist
  static async getOrCreateWallet(userId: number) {
    let wallet = await this.query().findById(userId);

    if (!wallet) {
      wallet = await this.query().insert({
        user_id: userId,
        balance: 0
      });
    }

    return wallet;
  }

  // Get the DASWOS AI wallet
  static async getDaswosAIWallet() {
    return await this.query().findById(0);
  }

  // Update a wallet's balance
  static async updateBalance(userId: number, newBalance: number) {
    return await this.query()
      .findById(userId)
      .patch({
        balance: newBalance,
        last_updated: new Date()
      });
  }
}

export default DasWosWallet;
