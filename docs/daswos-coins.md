# DasWos Coins System

DasWos Coins are a digital currency used within the DasWos platform. They can be purchased with real money via Stripe and used for various features within the application.

## Features

- **Finite Supply**: There is a fixed maximum supply of DasWos Coins (1 billion).
- **Centralized Control**: Initially, all coins are owned by the DASWOS AI system.
- **Persistent Balances**: User coin balances are stored in the database.
- **Transaction History**: All coin transactions are recorded and can be viewed by users.
- **Multiple Transaction Types**: Support for purchases, giveaways, and transfers.

## Database Schema

The DasWos Coins system uses three main tables:

1. **daswos_coins_total_supply**: Stores the total supply of coins and tracks how many have been minted.
   - `id`: Primary key
   - `total_amount`: The maximum number of coins that will ever exist
   - `minted_amount`: The number of coins that have been distributed
   - `creation_date`: When the supply was created

2. **daswos_wallets**: Stores each user's coin balance.
   - `user_id`: Primary key, references the users table
   - `balance`: The user's current coin balance
   - `last_updated`: When the balance was last updated

3. **daswos_transactions**: Records all coin movements.
   - `transaction_id`: Primary key
   - `from_user_id`: The sender's user ID (0 for DASWOS AI)
   - `to_user_id`: The recipient's user ID
   - `amount`: The number of coins transferred
   - `transaction_type`: The type of transaction (purchase, giveaway, transfer)
   - `timestamp`: When the transaction occurred
   - `reference_id`: Optional reference to external systems (e.g., Stripe payment ID)
   - `description`: Optional description of the transaction

## API Endpoints

### User Endpoints

- **GET /api/daswos-coins/balance**: Get the current user's coin balance
- **GET /api/daswos-coins/transactions**: Get the current user's transaction history
- **POST /api/daswos-coins/purchase**: Create a Stripe checkout session for coin purchase
- **POST /api/daswos-coins/transfer**: Transfer coins to another user

### Admin Endpoints

- **POST /api/daswos-coins/give**: Give coins to a user (admin only)

### Webhook Endpoints

- **POST /api/daswos-coins/webhook**: Stripe webhook for processing successful payments

## Stripe Integration

The DasWos Coins system integrates with Stripe for processing payments. When a user purchases coins:

1. A Stripe checkout session is created with the coin amount and price.
2. The user is redirected to the Stripe checkout page.
3. After successful payment, Stripe sends a webhook notification.
4. The webhook handler processes the payment and adds the coins to the user's balance.

### Required Environment Variables

```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLIENT_URL=http://localhost:5000
```

## Setting Up Stripe Webhooks

To set up Stripe webhooks for local development:

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Log in to your Stripe account: `stripe login`
3. Forward webhooks to your local server: `stripe listen --forward-to http://localhost:5000/api/daswos-coins/webhook`
4. Copy the webhook signing secret and add it to your .env file as STRIPE_WEBHOOK_SECRET

For production, set up a webhook endpoint in the Stripe dashboard pointing to your production server's webhook URL.

## Frontend Components

- **DasWosCoinsPage**: Main page for purchasing and managing coins
- **DasWosCoinsBalance**: Component for displaying the user's coin balance in the header
- **DasWosCoinIcon**: Icon component for consistent UI
- **DasWosCoinDisplay**: Component for displaying coin amounts

## Implementation Details

### Transaction Atomicity

All coin transactions are wrapped in database transactions to ensure atomicity. If any part of a transaction fails, the entire transaction is rolled back.

### Error Handling

The system includes comprehensive error handling to ensure that coins are not lost or duplicated. All errors are logged and appropriate error messages are returned to the user.

### Security

- All API endpoints that modify coin balances require authentication.
- The Stripe webhook endpoint verifies the webhook signature to prevent tampering.
- Admin endpoints require admin privileges.

## Future Enhancements

- **Coin Rewards**: Reward users with coins for completing certain actions.
- **Subscription Plans**: Allow users to subscribe to plans that provide a monthly coin allowance.
- **Coin Bundles**: Offer discounted coin bundles for bulk purchases.
- **Referral System**: Reward users with coins for referring new users.
