import { Model } from 'objection';
import knex from '../db/knex';

Model.knex(knex);

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['username', 'email'],
      properties: {
        id: { type: 'integer' },
        username: { type: 'string' },
        email: { type: 'string' },
        password_hash: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        is_admin: { type: 'boolean' },
        is_seller: { type: 'boolean' }
      }
    };
  }

  static get relationMappings() {
    return {
      wallet: {
        relation: Model.HasOneRelation,
        modelClass: require('./DasWosWallet').default,
        join: {
          from: 'users.id',
          to: 'daswos_wallets.user_id'
        }
      },
      sentTransactions: {
        relation: Model.HasManyRelation,
        modelClass: require('./DasWosTransaction').default,
        join: {
          from: 'users.id',
          to: 'daswos_transactions.from_user_id'
        }
      },
      receivedTransactions: {
        relation: Model.HasManyRelation,
        modelClass: require('./DasWosTransaction').default,
        join: {
          from: 'users.id',
          to: 'daswos_transactions.to_user_id'
        }
      }
    };
  }
}

export default User;



