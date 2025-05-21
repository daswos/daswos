/**
 * Migration to create DasWos coins tables
 */
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.all([
    // Create the total supply table
    knex.schema.createTable('daswos_coins_total_supply', function(table) {
      table.increments('id').primary();
      table.decimal('total_amount', 20, 0).notNullable();
      table.decimal('minted_amount', 20, 0).defaultTo(0);
      table.timestamp('creation_date').defaultTo(knex.fn.now());
    }),

    // Create the wallets table
    knex.schema.createTable('daswos_wallets', function(table) {
      table.integer('user_id').unsigned().primary();
      table.decimal('balance', 20, 0).notNullable().defaultTo(0);
      table.timestamp('last_updated').defaultTo(knex.fn.now());
      
      // Add foreign key to users table
      table.foreign('user_id').references('id').inTable('users');
    }),

    // Create the transactions table
    knex.schema.createTable('daswos_transactions', function(table) {
      table.increments('transaction_id').primary();
      table.integer('from_user_id').notNullable();
      table.integer('to_user_id').unsigned().notNullable();
      table.decimal('amount', 20, 0).notNullable();
      table.string('transaction_type', 50).notNullable();
      table.timestamp('timestamp').defaultTo(knex.fn.now());
      table.string('reference_id', 255).nullable();
      table.text('description').nullable();
      
      // Add foreign key to users table for to_user_id
      table.foreign('to_user_id').references('id').inTable('users');
      
      // Add indexes for efficient querying
      table.index('from_user_id');
      table.index('to_user_id');
      table.index('timestamp');
    })
  ]).then(() => {
    // Insert the initial supply and create the DASWOS AI wallet
    return Promise.all([
      knex('daswos_coins_total_supply').insert({
        total_amount: 1000000000 // 1 billion coins
      }),
      
      // Create a special user for the DASWOS AI if it doesn't exist
      knex.raw(`
        INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
        VALUES (0, 'DASWOS_AI', 'system@daswos.internal', '', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `).then(() => {
        // Create the DASWOS AI wallet with the initial supply
        return knex('daswos_wallets').insert({
          user_id: 0,
          balance: 1000000000 // 1 billion coins
        });
      })
    ]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return Promise.all([
    knex.schema.dropTableIfExists('daswos_transactions'),
    knex.schema.dropTableIfExists('daswos_wallets'),
    knex.schema.dropTableIfExists('daswos_coins_total_supply')
  ]);
}
