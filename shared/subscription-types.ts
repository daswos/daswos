// Subscription types for the application
export enum SubscriptionType {
  // Free tier - individual only, no Daswos AI
  LIMITED = "limited",

  // Paid tier - individual or family, includes Daswos AI
  UNLIMITED = "unlimited",

  // Legacy types (for backward compatibility)
  STANDARD = "standard",
  INDIVIDUAL = "individual",
  FAMILY = "family",
  ADMIN = "admin"
}

// Subscription features
export interface SubscriptionFeatures {
  // Basic features
  safeSphere: boolean;
  superSafe: boolean;

  // Premium features
  daswosAI: boolean;
  autoShop: boolean;

  // Family features
  familyAccounts: boolean;
  familyControls: boolean;
}

// Feature sets for each subscription type
export const subscriptionFeatures: Record<SubscriptionType, SubscriptionFeatures> = {
  [SubscriptionType.LIMITED]: {
    safeSphere: true,
    superSafe: true,
    daswosAI: false,
    autoShop: false,
    familyAccounts: false,
    familyControls: false
  },
  [SubscriptionType.UNLIMITED]: {
    safeSphere: true,
    superSafe: true,
    daswosAI: true,
    autoShop: true,
    familyAccounts: true,
    familyControls: true
  },
  // Legacy types - map to the new types for backward compatibility
  [SubscriptionType.STANDARD]: {
    safeSphere: true,
    superSafe: true,
    daswosAI: false,
    autoShop: false,
    familyAccounts: false,
    familyControls: false
  },
  [SubscriptionType.INDIVIDUAL]: {
    safeSphere: true,
    superSafe: true,
    daswosAI: true,
    autoShop: true,
    familyAccounts: false,
    familyControls: false
  },
  [SubscriptionType.FAMILY]: {
    safeSphere: true,
    superSafe: true,
    daswosAI: true,
    autoShop: true,
    familyAccounts: true,
    familyControls: true
  },
  [SubscriptionType.ADMIN]: {
    safeSphere: true,
    superSafe: true,
    daswosAI: true,
    autoShop: true,
    familyAccounts: true,
    familyControls: true
  }
};

// Subscription plans
export interface SubscriptionPlan {
  type: SubscriptionType;
  name: string;
  description: string;
  priceMonthly: number; // in cents
  priceAnnual: number;  // in cents
  features: string[];
  maxAccounts: number;  // maximum number of accounts (1 for individual, more for family)
}

// Subscription plans configuration
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    type: SubscriptionType.LIMITED,
    name: "Daswos Limited",
    description: "Basic protection for individuals",
    priceMonthly: 0, // Free
    priceAnnual: 0,  // Free
    features: [
      "SafeSphere protection",
      "SuperSafe mode",
      "All features except Daswos AI",
      "Individual account only"
    ],
    maxAccounts: 1
  },
  {
    type: SubscriptionType.UNLIMITED,
    name: "Daswos Unlimited",
    description: "Complete protection with AI features",
    priceMonthly: 500, // £5.00
    priceAnnual: 5000, // £50.00 (£4.17/month)
    features: [
      "All Limited features",
      "Daswos AI search",
      "AutoShop integration",
      "Family account support (up to 5 accounts)",
      "Control of umbrella accounts' SafeSphere and SuperSafe settings"
    ],
    maxAccounts: 5
  }
];

// Family account invitation
export interface FamilyInvitation {
  code: string;
  ownerUserId: number;
  email?: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  usedByUserId?: number;
}
