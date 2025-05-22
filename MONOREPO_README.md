# DasWos Monorepo

This monorepo contains the DasWos main application and admin panel.

## Structure

```
daswos-monorepo/
├── apps/
│   ├── daswos-main/     # Main application (daswos.com)
│   └── admin-panel/     # Admin panel (manipulai.com)
├── packages/
│   └── shared/          # Shared code between apps
├── migrations/          # Database migrations
├── scripts/             # Deployment and utility scripts
└── .env.production      # Production environment variables
```

## Prerequisites

- Node.js 20.x
- npm 10.x
- Fly.io CLI
- PostgreSQL client (for migrations)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   - `.env.production` for production settings

## Development

### Main App

```
npm run dev:main
```

### Admin Panel

```
npm run dev:admin
```

## Building

### Main App

```
npm run build:main
```

### Admin Panel

```
npm run build:admin
```

## Deployment

### Database Migration

Before deploying, ensure the production database schema is up-to-date:

```
npm run migrate:production
```

### Main App (daswos.com)

```
npm run deploy:main
```

### Admin Panel (manipulai.com)

```
npm run deploy:admin
```

## DNS Configuration

After deployment, follow the DNS instructions from Fly.io to configure your Cloudflare DNS settings:

1. Go to your Cloudflare dashboard for `daswos.com` and `manipulai.com`
2. Add the `A` or `CNAME` records as instructed by Fly.io
3. Ensure the proxy status (orange cloud) is enabled for these records

## Features

### Main App (daswos.com)
- Marketplace functionality
- User authentication
- Product listings
- Shopping cart
- Payment processing

### Admin Panel (manipulai.com)
- Admin authentication (username: admin, password: SODA)
- Feature toggles
- Product management
- User management
- Sales analytics

## Environment Variables

The following environment variables are required in `.env.production`:

- `DATABASE_URL`: Neon PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `NODE_ENV`: Set to "production"
- `PORT`: Set to 8080 for Fly.io compatibility
