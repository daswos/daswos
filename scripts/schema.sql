CREATE TABLE "ai_shopper_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"confidence" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"purchased_at" timestamp,
	"rejected_reason" text
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "app_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "bulk_buy_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer,
	"request_type" text NOT NULL,
	"quantity" integer,
	"max_budget" integer,
	"special_requirements" text,
	"preferred_delivery_date" timestamp,
	"status" text DEFAULT 'new' NOT NULL,
	"assigned_agent_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"source" text DEFAULT 'manual' NOT NULL,
	"recommendation_id" integer
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_id" integer,
	"level" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "category_closure" (
	"ancestor_id" integer NOT NULL,
	"descendant_id" integer NOT NULL,
	"depth" integer NOT NULL,
	CONSTRAINT "category_closure_ancestor_id_descendant_id_pk" PRIMARY KEY("ancestor_id","descendant_id")
);
--> statement-breakpoint
CREATE TABLE "collaborative_collaborators" (
	"id" serial PRIMARY KEY NOT NULL,
	"search_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text DEFAULT 'collaborator' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaborative_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"search_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"source_url" text,
	"source_type" text DEFAULT 'website' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"requires_permission" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "collaborative_searches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"topic" text NOT NULL,
	"tags" text[] NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "daswos_coins_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"related_order_id" integer,
	"related_split_buy_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "daswos_ai_chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "daswos_ai_chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" text DEFAULT 'New Chat' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daswos_ai_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"source_type" text NOT NULL,
	"source_id" integer,
	"source_url" text,
	"source_name" text NOT NULL,
	"relevance_score" integer DEFAULT 0 NOT NULL,
	"excerpt" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_invitation_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"owner_user_id" integer NOT NULL,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_by_user_id" integer,
	CONSTRAINT "family_invitation_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "information_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"summary" text NOT NULL,
	"source_url" text NOT NULL,
	"source_name" text NOT NULL,
	"source_verified" boolean DEFAULT false NOT NULL,
	"source_type" text DEFAULT 'website' NOT NULL,
	"trust_score" integer NOT NULL,
	"category" text NOT NULL,
	"tags" text[] NOT NULL,
	"image_url" text,
	"verified_since" text,
	"warning" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price_at_purchase" integer NOT NULL,
	"item_name_snapshot" text NOT NULL,
	"split_buy_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"total_amount" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"shipping_address" text NOT NULL,
	"billing_address" text NOT NULL,
	"payment_method" text NOT NULL,
	"payment_reference" text,
	"notes" text,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"image_url" text NOT NULL,
	"seller_id" integer NOT NULL,
	"seller_name" text NOT NULL,
	"seller_verified" boolean DEFAULT false NOT NULL,
	"seller_type" text DEFAULT 'merchant' NOT NULL,
	"trust_score" integer NOT NULL,
	"tags" text[] NOT NULL,
	"shipping" text NOT NULL,
	"original_price" integer,
	"discount" integer,
	"verified_since" text,
	"warning" text,
	"is_bulk_buy" boolean DEFAULT false NOT NULL,
	"bulk_minimum_quantity" integer,
	"bulk_discount_rate" integer,
	"image_description" text,
	"category_id" integer,
	"ai_attributes" jsonb DEFAULT '{}',
	"search_vector" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "resource_permission_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_id" integer NOT NULL,
	"requester_id" integer NOT NULL,
	"message" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "search_queries" (
	"id" serial PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"sphere" text NOT NULL,
	"content_type" text DEFAULT 'products' NOT NULL,
	"filters" jsonb,
	"user_id" integer,
	"super_safe_enabled" boolean DEFAULT false,
	"super_safe_settings" jsonb
);
--> statement-breakpoint
CREATE TABLE "seller_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"deposit_amount" integer,
	"comments" text,
	"document_urls" text[]
);
--> statement-breakpoint
CREATE TABLE "sellers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_name" text NOT NULL,
	"business_type" text NOT NULL,
	"verification_status" text DEFAULT 'pending' NOT NULL,
	"business_address" text NOT NULL,
	"contact_phone" text NOT NULL,
	"tax_id" text,
	"website" text,
	"year_established" integer,
	"description" text,
	"profile_image_url" text,
	"document_urls" text[],
	"trust_score" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "sellers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "split_buy_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"split_buy_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"quantity_committed" integer DEFAULT 1 NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "split_buys" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"initiator_user_id" integer NOT NULL,
	"target_quantity" integer NOT NULL,
	"current_quantity" integer DEFAULT 0 NOT NULL,
	"price_per_unit" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"description" text,
	"min_participants" integer DEFAULT 2,
	"max_participants" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_dasbar_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"items" jsonb NOT NULL,
	"max_visible_items" integer DEFAULT 4 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_payment_method_id" text NOT NULL,
	"last4" text NOT NULL,
	"card_type" text NOT NULL,
	"expiry_month" integer NOT NULL,
	"expiry_year" integer NOT NULL,
	"is_default" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_token" text NOT NULL,
	"device_info" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_active" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_seller" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"avatar" text,
	"has_subscription" boolean DEFAULT false NOT NULL,
	"subscription_type" text,
	"subscription_expires_at" timestamp,
	"is_family_owner" boolean DEFAULT false NOT NULL,
	"family_owner_id" integer,
	"parent_account_id" integer,
	"is_child_account" boolean DEFAULT false NOT NULL,
	"super_safe_mode" boolean DEFAULT false NOT NULL,
	"super_safe_settings" jsonb DEFAULT '{"blockGambling":true,"blockAdultContent":true,"blockOpenSphere":false}'::jsonb,
	"safe_sphere_active" boolean DEFAULT false NOT NULL,
	"ai_shopper_enabled" boolean DEFAULT false NOT NULL,
	"ai_shopper_settings" jsonb DEFAULT '{"autoPurchase":false,"autoPaymentEnabled":false,"confidenceThreshold":0.85,"budgetLimit":5000,"maxTransactionLimit":10000,"preferredCategories":[],"avoidTags":[],"minimumTrustScore":85,"purchaseMode":"refined","maxPricePerItem":5000,"maxCoinsPerItem":50,"maxCoinsPerDay":100,"maxCoinsOverall":1000,"purchaseFrequency":{"hourly":1,"daily":5,"monthly":50}}'::jsonb,
	"daswos_coins" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "category_closure" ADD CONSTRAINT "category_closure_ancestor_id_categories_id_fk" FOREIGN KEY ("ancestor_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_closure" ADD CONSTRAINT "category_closure_descendant_id_categories_id_fk" FOREIGN KEY ("descendant_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_invitation_codes" ADD CONSTRAINT "family_invitation_codes_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_invitation_codes" ADD CONSTRAINT "family_invitation_codes_used_by_user_id_users_id_fk" FOREIGN KEY ("used_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_dasbar_preferences" ADD CONSTRAINT "user_dasbar_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;