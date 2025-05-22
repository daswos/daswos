CREATE TABLE "ai_shopper_recommendations" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending'::text NOT NULL,
	"confidence" integer NOT NULL,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone,
	"purchased_at" timestamp without time zone,
	"rejected_reason" text
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" serial NOT NULL PRIMARY KEY,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone,
	CONSTRAINT "app_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "bulk_buy_requests" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"product_id" integer,
	"request_type" text NOT NULL,
	"quantity" integer,
	"max_budget" integer,
	"special_requirements" text,
	"preferred_delivery_date" timestamp without time zone,
	"status" text DEFAULT 'new'::text NOT NULL,
	"assigned_agent_id" integer,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"added_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone,
	"source" text DEFAULT 'manual'::text NOT NULL,
	"recommendation_id" integer
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial NOT NULL PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"parent_id" integer,
	"level" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone
);
--> statement-breakpoint
CREATE TABLE "category_closure" (
	"ancestor_id" integer NOT NULL,
	"descendant_id" integer NOT NULL,
	"depth" integer NOT NULL,
	CONSTRAINT "category_closure_ancestor_id_descendant_id_pk" PRIMARY KEY("ancestor_id", "descendant_id")
);
--> statement-breakpoint
CREATE TABLE "collaborative_collaborators" (
	"id" serial NOT NULL PRIMARY KEY,
	"search_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text DEFAULT 'collaborator'::text NOT NULL,
	"status" text DEFAULT 'active'::text NOT NULL,
	"joined_at" timestamp without time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaborative_resources" (
	"id" serial NOT NULL PRIMARY KEY,
	"search_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"source_url" text,
	"source_type" text DEFAULT 'website'::text NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"requires_permission" boolean DEFAULT false NOT NULL,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone
);
--> statement-breakpoint
CREATE TABLE "collaborative_searches" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"topic" text NOT NULL,
	"tags" text[] NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'active'::text NOT NULL,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone
);
--> statement-breakpoint
CREATE TABLE "daswos_ai_chat_messages" (
	"id" serial NOT NULL PRIMARY KEY,
	"chat_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp without time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "daswos_ai_chats" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer,
	"title" text DEFAULT 'New Chat'::text NOT NULL,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone,
	"is_archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daswos_ai_sources" (
	"id" serial NOT NULL PRIMARY KEY,
	"message_id" integer NOT NULL,
	"source_type" text NOT NULL,
	"source_id" integer,
	"source_url" text,
	"source_name" text NOT NULL,
	"relevance_score" integer DEFAULT 0 NOT NULL,
	"excerpt" text,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daswos_coins_total_supply" (
	"id" serial NOT NULL PRIMARY KEY,
	"total_amount" numeric NOT NULL,
	"minted_amount" numeric DEFAULT 0,
	"creation_date" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "daswos_coins_transactions" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'completed'::text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"related_order_id" integer,
	"related_split_buy_id" integer,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp without time zone
);
--> statement-breakpoint
CREATE TABLE "daswos_transactions" (
	"transaction_id" serial NOT NULL PRIMARY KEY,
	"from_user_id" integer NOT NULL,
	"to_user_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"transaction_type" varchar(50) NOT NULL,
	"timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
	"reference_id" varchar(255),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "daswos_wallets" (
	"user_id" integer NOT NULL,
	"balance" numeric DEFAULT 0 NOT NULL,
	"last_updated" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY ("user_id")
);
--> statement-breakpoint
CREATE TABLE "family_invitation_codes" (
	"id" serial NOT NULL PRIMARY KEY,
	"code" text NOT NULL,
	"owner_user_id" integer NOT NULL,
	"email" text,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp without time zone NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_by_user_id" integer,
	CONSTRAINT "family_invitation_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "information" (
	"id" serial NOT NULL PRIMARY KEY,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100),
	"tags" text[],
	"source" varchar(255),
	"imageurl" text,
	"sphere" varchar(50),
	"createdat" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "information_content" (
	"id" serial NOT NULL PRIMARY KEY,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"summary" text NOT NULL,
	"source_url" text NOT NULL,
	"source_name" text NOT NULL,
	"source_verified" boolean DEFAULT false NOT NULL,
	"source_type" text DEFAULT 'website'::text NOT NULL,
	"trust_score" integer NOT NULL,
	"category" text NOT NULL,
	"tags" text[] NOT NULL,
	"image_url" text,
	"verified_since" text,
	"warning" text,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial NOT NULL PRIMARY KEY,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price_at_purchase" integer NOT NULL,
	"item_name_snapshot" text NOT NULL,
	"split_buy_id" integer,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"order_date" timestamp without time zone DEFAULT now() NOT NULL,
	"total_amount" integer NOT NULL,
	"status" text DEFAULT 'pending'::text NOT NULL,
	"shipping_address" text NOT NULL,
	"billing_address" text NOT NULL,
	"payment_method" text NOT NULL,
	"payment_reference" text,
	"notes" text,
	"updated_at" timestamp without time zone
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial NOT NULL PRIMARY KEY,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"image_url" text NOT NULL,
	"seller_id" integer NOT NULL,
	"seller_name" text NOT NULL,
	"seller_verified" boolean DEFAULT false NOT NULL,
	"seller_type" text DEFAULT 'merchant'::text NOT NULL,
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
	"ai_attributes" jsonb DEFAULT '{}'::jsonb,
	"search_vector" text,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone
);
--> statement-breakpoint
CREATE TABLE "resource_permission_requests" (
	"id" serial NOT NULL PRIMARY KEY,
	"resource_id" integer NOT NULL,
	"requester_id" integer NOT NULL,
	"message" text,
	"status" text DEFAULT 'pending'::text NOT NULL,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone
);
--> statement-breakpoint
CREATE TABLE "search_queries" (
	"id" serial NOT NULL PRIMARY KEY,
	"query" text NOT NULL,
	"timestamp" timestamp without time zone DEFAULT now() NOT NULL,
	"sphere" text NOT NULL,
	"content_type" text DEFAULT 'products'::text NOT NULL,
	"filters" jsonb,
	"user_id" integer,
	"super_safe_enabled" boolean DEFAULT false,
	"super_safe_settings" jsonb
);
--> statement-breakpoint
CREATE TABLE "seller_verifications" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending'::text NOT NULL,
	"submitted_at" timestamp without time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp without time zone,
	"deposit_amount" integer,
	"comments" text,
	"document_urls" text[]
);
--> statement-breakpoint
CREATE TABLE "sellers" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"business_name" text NOT NULL,
	"business_type" text NOT NULL,
	"verification_status" text DEFAULT 'pending'::text NOT NULL,
	"business_address" text NOT NULL,
	"contact_phone" text NOT NULL,
	"tax_id" text,
	"website" text,
	"year_established" integer,
	"description" text,
	"profile_image_url" text,
	"document_urls" text[],
	"trust_score" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone,
	CONSTRAINT "sellers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sid" character varying NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp without time zone NOT NULL,
	PRIMARY KEY ("sid")
);
--> statement-breakpoint
CREATE TABLE "split_buy_participants" (
	"id" serial NOT NULL PRIMARY KEY,
	"split_buy_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"quantity_committed" integer DEFAULT 1 NOT NULL,
	"payment_status" text DEFAULT 'pending'::text NOT NULL,
	"joined_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone
);
--> statement-breakpoint
CREATE TABLE "split_buys" (
	"id" serial NOT NULL PRIMARY KEY,
	"product_id" integer NOT NULL,
	"initiator_user_id" integer NOT NULL,
	"target_quantity" integer NOT NULL,
	"current_quantity" integer DEFAULT 0 NOT NULL,
	"price_per_unit" integer NOT NULL,
	"status" text DEFAULT 'active'::text NOT NULL,
	"expires_at" timestamp without time zone,
	"description" text,
	"min_participants" integer DEFAULT 2,
	"max_participants" integer,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone
);
--> statement-breakpoint
CREATE TABLE "user_dasbar_preferences" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"items" jsonb NOT NULL,
	"max_visible_items" integer DEFAULT 4 NOT NULL,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp without time zone
);
--> statement-breakpoint
CREATE TABLE "user_payment_methods" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_payment_method_id" text NOT NULL,
	"last4" text NOT NULL,
	"card_type" text NOT NULL,
	"expiry_month" integer NOT NULL,
	"expiry_year" integer NOT NULL,
	"is_default" boolean DEFAULT true NOT NULL,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_product_preferences" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"preference_score" double precision DEFAULT 0 NOT NULL,
	"last_updated" timestamp without time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_product_preferences_user_id_category_id_key" UNIQUE("user_id", "category_id")
);
--> statement-breakpoint
CREATE TABLE "user_purchase_history" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"category_id" integer,
	"purchase_date" timestamp without time zone DEFAULT now() NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_search_history" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"search_query" text NOT NULL,
	"search_date" timestamp without time zone DEFAULT now() NOT NULL,
	"category_id" integer,
	"clicked_product_id" integer
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial NOT NULL PRIMARY KEY,
	"user_id" integer NOT NULL,
	"session_token" text NOT NULL,
	"device_info" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_active" timestamp without time zone DEFAULT now() NOT NULL,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp without time zone NOT NULL,
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial NOT NULL PRIMARY KEY,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"created_at" timestamp without time zone DEFAULT now() NOT NULL,
	"is_seller" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"avatar" text,
	"has_subscription" boolean DEFAULT false NOT NULL,
	"subscription_type" text,
	"subscription_expires_at" timestamp without time zone,
	"is_family_owner" boolean DEFAULT false NOT NULL,
	"family_owner_id" integer,
	"parent_account_id" integer,
	"is_child_account" boolean DEFAULT false NOT NULL,
	"super_safe_mode" boolean DEFAULT false NOT NULL,
	"super_safe_settings" jsonb DEFAULT '{"blockGambling": true, "blockOpenSphere": false, "blockAdultContent": true}'::jsonb,
	"safe_sphere_active" boolean DEFAULT false NOT NULL,
	"ai_shopper_enabled" boolean DEFAULT false NOT NULL,
	"ai_shopper_settings" jsonb DEFAULT '{"avoidTags": [], "budgetLimit": 5000, "autoPurchase": false, "purchaseMode": "refined", "maxCoinsPerDay": 100, "maxCoinsOverall": 1000, "maxCoinsPerItem": 50, "maxPricePerItem": 5000, "minimumTrustScore": 85, "purchaseFrequency": {"daily": 5, "hourly": 1, "monthly": 50}, "autoPaymentEnabled": false, "confidenceThreshold": 0.85, "maxTransactionLimit": 10000, "preferredCategories": []}'::jsonb,
	"daswos_coins" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "category_closure" ADD CONSTRAINT "category_closure_ancestor_id_categories_id_fk" FOREIGN KEY ("ancestor_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_closure" ADD CONSTRAINT "category_closure_descendant_id_categories_id_fk" FOREIGN KEY ("descendant_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daswos_transactions" ADD CONSTRAINT "fk_to_user" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daswos_wallets" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_invitation_codes" ADD CONSTRAINT "family_invitation_codes_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_invitation_codes" ADD CONSTRAINT "family_invitation_codes_used_by_user_id_users_id_fk" FOREIGN KEY ("used_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_dasbar_preferences" ADD CONSTRAINT "user_dasbar_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_product_preferences" ADD CONSTRAINT "user_product_preferences_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_product_preferences" ADD CONSTRAINT "user_product_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_purchase_history" ADD CONSTRAINT "user_purchase_history_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_purchase_history" ADD CONSTRAINT "user_purchase_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_purchase_history" ADD CONSTRAINT "user_purchase_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_search_history" ADD CONSTRAINT "user_search_history_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_search_history" ADD CONSTRAINT "user_search_history_clicked_product_id_fkey" FOREIGN KEY ("clicked_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_search_history" ADD CONSTRAINT "user_search_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
