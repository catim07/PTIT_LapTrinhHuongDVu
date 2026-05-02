# Lotte Mart Project - Detailed Schema Report

## 1. List of Collections

- **database**: 1 records
- **roles**: 3 records
- **users**: 6 records
- **auth_tokens**: 1 records
- **otp_logs**: 1 records
- **notification_subscriptions**: 1 records
- **categories**: 4 records
- **products**: 12 records
- **product_images**: 5 records
- **ar_models**: 1 records
- **branches**: 2 records
- **branch_products**: 13 records
- **inventory_transactions**: 2 records
- **delivery_slots**: 2 records
- **user_addresses**: 2 records
- **wishlists**: 2 records
- **product_questions**: 2 records
- **search_history**: 2 records
- **carts**: 1 records
- **promotions**: 4 records
- **coupons**: 6 records
- **events**: 1 records
- **event_categories**: 6 records
- **event_posts**: 12 records
- **post_images**: 3 records
- **event_post_details**: 12 records
- **orders**: 1 records
- **order_addresses**: 1 records
- **payment_transactions**: 1 records
- **purchase_history**: 1 records
- **reviews**: 9 records
- **comments**: 1 records
- **support_tickets**: 4 records
- **messages**: 8 records
- **notifications**: 5 records
- **recommendation_logs**: 1 records
- **hot_deals**: 3 records
- **featured_collections**: 2 records
- **analytics_placeholders**: 1 records
- **promo_banners**: 2 records
- **home_banners**: 3 records
- **tag_colors**: 1 records
- **filters**: 1 records
- **home_sections**: 5 records
- **product_badges**: 1 records
- **ui_settings**: 1 records
- **product_policies**: 3 records
- **related_products**: 1 records
- **frequently_bought_together**: 2 records
- **loyalty_transactions**: 7 records
- **product_search_index**: 3 records
- **event_filters**: 1 records
- **event_comments**: 5 records
- **event_tags**: 10 records
- **featured_events**: 4 records
- **payment_methods**: 4 records
- **coupon_usage**: 2 records

## 2. Detailed Schema by Collection

### **Collection**: `database`
- **Purpose**: Storage for database entities used across DataService, Redux and UI pages.
- **Fields:**
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `roles`
- **Purpose**: Storage for roles entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `name`: **string** (Required) - *roles -> name* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `users`
- **Purpose**: Storage for users entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `username`: **string** (Required) - *users -> username* used extensively in UI.
  - `email`: **string** (Required) - *users -> email* used extensively in UI.
  - `phone`: **string** (Required) - *users -> phone* used extensively in UI.
  - `password`: **string** (Required) - *users -> password* used extensively in UI.
  - `role_id`: **number** (Required) - *users -> role_id* used extensively in UI.
  - `branch_id`: **number** (Required, Nullable) - *users -> branch_id* used extensively in UI.
  - `lotte_points`: **number** (Required) - *users -> lotte_points* used extensively in UI.
  - `membership_level`: **string** (Required) - *users -> membership_level* used extensively in UI.
  - `signup_method`: **string** (Required) - *users -> signup_method* used extensively in UI.
  - `social_providers`: **array_of_undefined | array_of_objects** (Required) - *users -> social_providers* used extensively in UI.
  - `created_at`: **string** (Required) - *users -> created_at* used extensively in UI.
  - `last_login`: **string** (Required) - *users -> last_login* used extensively in UI.
  - `status`: **string** (Required) - *users -> status* used extensively in UI.
  - `preferences`: **object** (Required) - *users -> preferences* used extensively in UI.
    - *nested structure*: `newsletter, sms_alerts, language, receive_promotions, eco_prefer, favorite_categories, notification_email_promo, notification_sms_order, notification_push_order, notification_promo, notification_system`
  - `email_verified`: **boolean** (Required) - *users -> email_verified* used extensively in UI.
  - `password_hash`: **string** (Required) - *users -> password_hash* used extensively in UI.
  - `avatar`: **string** (Required) - *users -> avatar* used extensively in UI.
  - `full_name`: **string** (Required) - *users -> full_name* used extensively in UI.
  - `dob`: **string** (Required) - *users -> dob* used extensively in UI.
  - `gender`: **string** (Required) - *users -> gender* used extensively in UI.
  - `bio`: **string** (Required) - *users -> bio* used extensively in UI.
  - `profile_completed`: **boolean** (Required) - *users -> profile_completed* used extensively in UI.
  - `default_payment_method`: **object** (Required) - *users -> default_payment_method* used extensively in UI.
    - *nested structure*: `type, last4, brand, card_id`
  - `wallet_balance`: **number** (Required) - *users -> wallet_balance* used extensively in UI.
  - `social_links`: **object** (Required) - *users -> social_links* used extensively in UI.
    - *nested structure*: `facebook, google`
  - `security`: **object** (Required) - *users -> security* used extensively in UI.
    - *nested structure*: `two_factor_enabled, last_login_device, last_login_at`
  - `settings`: **object** (Required) - *users -> settings* used extensively in UI.
    - *nested structure*: `language, dark_mode, privacy_profile_visible, marketing_opt_in, sms_opt_in`
  - `address`: **string** (Optional) - *users -> address* used extensively in UI.
- **Relations:**
  - `role_id` -> **roles** (Foreign Key)
  - `branch_id` -> **branches** (Foreign Key)
- **Notes:**

---

### **Collection**: `auth_tokens`
- **Purpose**: Storage for auth_tokens entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *auth_tokens -> user_id* used extensively in UI.
  - `access_token`: **string** (Required) - *auth_tokens -> access_token* used extensively in UI.
  - `refresh_token`: **string** (Required) - *auth_tokens -> refresh_token* used extensively in UI.
  - `device`: **string** (Required) - *auth_tokens -> device* used extensively in UI.
  - `expires_at`: **string** (Required) - *auth_tokens -> expires_at* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `otp_logs`
- **Purpose**: Storage for otp_logs entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `target`: **string** (Required) - *otp_logs -> target* used extensively in UI.
  - `otp`: **string** (Required) - *otp_logs -> otp* used extensively in UI.
  - `type`: **string** (Required) - *otp_logs -> type* used extensively in UI.
  - `created_at`: **string** (Required) - *otp_logs -> created_at* used extensively in UI.
  - `expires_at`: **string** (Required) - *otp_logs -> expires_at* used extensively in UI.
  - `status`: **string** (Required) - *otp_logs -> status* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `notification_subscriptions`
- **Purpose**: Storage for notification_subscriptions entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *notification_subscriptions -> user_id* used extensively in UI.
  - `provider`: **string** (Required) - *notification_subscriptions -> provider* used extensively in UI.
  - `device_token`: **string** (Required) - *notification_subscriptions -> device_token* used extensively in UI.
  - `created_at`: **string** (Required) - *notification_subscriptions -> created_at* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `categories`
- **Purpose**: Storage for categories entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `name`: **string** (Required) - *categories -> name* used extensively in UI.
  - `parent_id`: **unknown** (Required, Nullable) - *categories -> parent_id* used extensively in UI.
  - `icon`: **string** (Required) - *categories -> icon* used extensively in UI.
  - `product_count`: **number** (Required) - *categories -> product_count* used extensively in UI.
  - `slug`: **string** (Required) - *categories -> slug* used extensively in UI.
  - `description`: **string** (Required) - *categories -> description* used extensively in UI.
  - `display_order`: **number** (Required) - *categories -> display_order* used extensively in UI.
  - `is_active`: **boolean** (Required) - *categories -> is_active* used extensively in UI.
- **Relations:**
  - `parent_id` -> **categories** (Foreign Key)
- **Notes:**

---

### **Collection**: `products`
- **Purpose**: Storage for products entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `name`: **string** (Required) - *products -> name* used extensively in UI.
  - `sku`: **string** (Required) - *products -> sku* used extensively in UI.
  - `category_id`: **number** (Required) - *products -> category_id* used extensively in UI.
  - `brand`: **string** (Required) - *products -> brand* used extensively in UI.
  - `description`: **string** (Required) - *products -> description* used extensively in UI.
  - `short_description`: **string | array_of_string** (Optional) - *products -> short_description* used extensively in UI.
  - `eco_label`: **boolean** (Optional) - *products -> eco_label* used extensively in UI.
  - `images`: **array_of_string** (Required) - *products -> images* used extensively in UI.
  - `gallery`: **array_of_string** (Optional) - *products -> gallery* used extensively in UI.
  - `ar_model_url`: **string** (Optional) - *products -> ar_model_url* used extensively in UI.
  - `created_at`: **string** (Optional) - *products -> created_at* used extensively in UI.
  - `origin_country`: **string** (Optional) - *products -> origin_country* used extensively in UI.
  - `unit`: **string** (Optional) - *products -> unit* used extensively in UI.
  - `weight`: **string** (Optional) - *products -> weight* used extensively in UI.
  - `tags`: **array_of_string** (Optional) - *products -> tags* used extensively in UI.
  - `average_rating`: **number** (Required) - *products -> average_rating* used extensively in UI.
  - `review_count`: **number** (Required) - *products -> review_count* used extensively in UI.
  - `vat_included`: **boolean** (Optional) - *products -> vat_included* used extensively in UI.
  - `shipping_excluded`: **boolean** (Optional) - *products -> shipping_excluded* used extensively in UI.
  - `highlights`: **array_of_string** (Optional) - *products -> highlights* used extensively in UI.
  - `specifications`: **array_of_objects** (Optional) - *products -> specifications* used extensively in UI.
  - `rating_breakdown`: **object** (Optional) - *products -> rating_breakdown* used extensively in UI.
    - *nested structure*: `1, 2, 3, 4, 5`
  - `related_product_ids`: **array_of_number** (Optional) - *products -> related_product_ids* used extensively in UI.
  - `frequently_bought_together`: **array_of_number** (Optional) - *products -> frequently_bought_together* used extensively in UI.
  - `created_by`: **number** (Required) - *products -> created_by* used extensively in UI.
  - `origin_flag`: **string** (Optional) - *products -> origin_flag* used extensively in UI.
  - `product_details`: **array_of_string** (Optional) - *products -> product_details* used extensively in UI.
  - `usage_guide`: **string** (Optional) - *products -> usage_guide* used extensively in UI.
  - `storage_guide`: **string** (Optional) - *products -> storage_guide* used extensively in UI.
  - `notes`: **string** (Optional) - *products -> notes* used extensively in UI.
  - `recipe_suggestions`: **array_of_string** (Optional) - *products -> recipe_suggestions* used extensively in UI.
- **Relations:**
  - `category_id` -> **categories** (Foreign Key)
  - `created_by` -> **users** (Foreign Key)
- **Notes:**

---

### **Collection**: `product_images`
- **Purpose**: Storage for product_images entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `product_id`: **number** (Required) - *product_images -> product_id* used extensively in UI.
  - `url`: **string** (Required) - *product_images -> url* used extensively in UI.
  - `is_360`: **boolean** (Required) - *product_images -> is_360* used extensively in UI.
- **Relations:**
  - `product_id` -> **products** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `ar_models`
- **Purpose**: Storage for ar_models entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `product_id`: **number** (Required) - *ar_models -> product_id* used extensively in UI.
  - `url`: **string** (Required) - *ar_models -> url* used extensively in UI.
  - `format`: **string** (Required) - *ar_models -> format* used extensively in UI.
- **Relations:**
  - `product_id` -> **products** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `branches`
- **Purpose**: Storage for branches entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `name`: **string** (Required) - *branches -> name* used extensively in UI.
  - `city`: **string** (Required) - *branches -> city* used extensively in UI.
  - `address`: **string** (Required) - *branches -> address* used extensively in UI.
  - `phone`: **string** (Required) - *branches -> phone* used extensively in UI.
  - `opening_hours`: **string** (Required) - *branches -> opening_hours* used extensively in UI.
  - `manager_user_id`: **number** (Required) - *branches -> manager_user_id* used extensively in UI.
  - `branch_product_ids`: **array_of_number** (Required) - *branches -> branch_product_ids* used extensively in UI.
- **Relations:**
  - `manager_user_id` -> **users** (Foreign Key)
- **Notes:**

---

### **Collection**: `branch_products`
- **Purpose**: Storage for branch_products entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `branch_id`: **number** (Required) - *branch_products -> branch_id* used extensively in UI.
  - `product_id`: **number** (Required) - *branch_products -> product_id* used extensively in UI.
  - `sku`: **string** (Required) - *branch_products -> sku* used extensively in UI.
  - `price`: **number** (Required) - *branch_products -> price* used extensively in UI.
  - `original_price`: **number** (Required) - *branch_products -> original_price* used extensively in UI.
  - `discount_percent`: **number** (Required) - *branch_products -> discount_percent* used extensively in UI.
  - `stock`: **number** (Required) - *branch_products -> stock* used extensively in UI.
  - `sold_count`: **number** (Required) - *branch_products -> sold_count* used extensively in UI.
  - `is_active`: **boolean** (Required) - *branch_products -> is_active* used extensively in UI.
  - `is_new`: **boolean** (Optional) - *branch_products -> is_new* used extensively in UI.
  - `is_best_seller`: **boolean** (Optional) - *branch_products -> is_best_seller* used extensively in UI.
  - `is_featured`: **boolean** (Optional) - *branch_products -> is_featured* used extensively in UI.
  - `max_purchase_limit`: **number** (Required) - *branch_products -> max_purchase_limit* used extensively in UI.
  - `badges`: **array_of_string** (Optional) - *branch_products -> badges* used extensively in UI.
  - `policies`: **array_of_string** (Optional) - *branch_products -> policies* used extensively in UI.
  - `is_available`: **boolean** (Required) - *branch_products -> is_available* used extensively in UI.
  - `lead_time_days`: **number** (Required) - *branch_products -> lead_time_days* used extensively in UI.
- **Relations:**
  - `branch_id` -> **branches** (Foreign Key)
  - `product_id` -> **products** (Foreign Key)
- **Notes:**

---

### **Collection**: `inventory_transactions`
- **Purpose**: Storage for inventory_transactions entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `branch_product_id`: **number** (Required) - *inventory_transactions -> branch_product_id* used extensively in UI.
  - `branch_id`: **number** (Required) - *inventory_transactions -> branch_id* used extensively in UI.
  - `product_id`: **number** (Required) - *inventory_transactions -> product_id* used extensively in UI.
  - `quantity`: **number** (Required) - *inventory_transactions -> quantity* used extensively in UI.
  - `transaction_type`: **string** (Required) - *inventory_transactions -> transaction_type* used extensively in UI.
  - `user_id`: **number** (Required) - *inventory_transactions -> user_id* used extensively in UI.
  - `transaction_date`: **string** (Required) - *inventory_transactions -> transaction_date* used extensively in UI.
- **Relations:**
  - `branch_product_id` -> **branch_products** (Foreign Key)
  - `user_id` -> **users** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `delivery_slots`
- **Purpose**: Storage for delivery_slots entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `branch_id`: **number** (Required) - *delivery_slots -> branch_id* used extensively in UI.
  - `time`: **string** (Required) - *delivery_slots -> time* used extensively in UI.
  - `date`: **string** (Required) - *delivery_slots -> date* used extensively in UI.
  - `available`: **boolean** (Required) - *delivery_slots -> available* used extensively in UI.
- **Relations:**
  - `branch_id` -> **branches** (Foreign Key)
- **Notes:**

---

### **Collection**: `user_addresses`
- **Purpose**: Storage for user_addresses entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *user_addresses -> user_id* used extensively in UI.
  - `name`: **string** (Required) - *user_addresses -> name* used extensively in UI.
  - `phone`: **string** (Required) - *user_addresses -> phone* used extensively in UI.
  - `city`: **string** (Required) - *user_addresses -> city* used extensively in UI.
  - `district`: **string** (Required) - *user_addresses -> district* used extensively in UI.
  - `ward`: **string** (Required) - *user_addresses -> ward* used extensively in UI.
  - `street`: **string** (Required) - *user_addresses -> street* used extensively in UI.
  - `is_default`: **boolean** (Required) - *user_addresses -> is_default* used extensively in UI.
  - `created_at`: **string** (Required) - *user_addresses -> created_at* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `wishlists`
- **Purpose**: Storage for wishlists entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *wishlists -> user_id* used extensively in UI.
  - `product_id`: **number** (Required) - *wishlists -> product_id* used extensively in UI.
  - `created_at`: **string** (Required) - *wishlists -> created_at* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
  - `product_id` -> **products** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `product_questions`
- **Purpose**: Storage for product_questions entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `product_id`: **number** (Required) - *product_questions -> product_id* used extensively in UI.
  - `user_id`: **number** (Required) - *product_questions -> user_id* used extensively in UI.
  - `question`: **string** (Required) - *product_questions -> question* used extensively in UI.
  - `answer`: **string** (Required) - *product_questions -> answer* used extensively in UI.
  - `created_at`: **string** (Required) - *product_questions -> created_at* used extensively in UI.
- **Relations:**
  - `product_id` -> **products** (Foreign Key)
  - `user_id` -> **users** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `search_history`
- **Purpose**: Storage for search_history entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *search_history -> user_id* used extensively in UI.
  - `keyword`: **string** (Required) - *search_history -> keyword* used extensively in UI.
  - `searched_at`: **string** (Required) - *search_history -> searched_at* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `carts`
- **Purpose**: Storage for carts entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *carts -> user_id* used extensively in UI.
  - `branch_id`: **number** (Required) - *carts -> branch_id* used extensively in UI.
  - `created_at`: **string** (Required) - *carts -> created_at* used extensively in UI.
  - `items`: **array_of_objects** (Required) - *carts -> items* used extensively in UI.
  - `currency`: **string** (Required) - *carts -> currency* used extensively in UI.
  - `updated_at`: **string** (Required) - *carts -> updated_at* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
  - `branch_id` -> **branches** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `promotions`
- **Purpose**: Storage for promotions entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `title`: **string** (Required) - *promotions -> title* used extensively in UI.
  - `description`: **string** (Required) - *promotions -> description* used extensively in UI.
  - `type`: **string** (Required) - *promotions -> type* used extensively in UI.
  - `value`: **number** (Required) - *promotions -> value* used extensively in UI.
  - `image_url`: **string** (Required) - *promotions -> image_url* used extensively in UI.
  - `badge`: **string** (Required) - *promotions -> badge* used extensively in UI.
  - `end_date`: **string** (Required) - *promotions -> end_date* used extensively in UI.
  - `sold_count`: **number** (Required) - *promotions -> sold_count* used extensively in UI.
  - `original_price`: **number** (Required, Nullable) - *promotions -> original_price* used extensively in UI.
  - `category`: **string** (Required) - *promotions -> category* used extensively in UI.
  - `thumbs`: **array_of_string** (Required) - *promotions -> thumbs* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `coupons`
- **Purpose**: Storage for coupons entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `code`: **string** (Required) - *coupons -> code* used extensively in UI.
  - `type`: **string** (Optional) - *coupons -> type* used extensively in UI.
  - `value`: **number** (Optional) - *coupons -> value* used extensively in UI.
  - `min_order`: **number** (Optional) - *coupons -> min_order* used extensively in UI.
  - `start_date`: **string** (Required) - *coupons -> start_date* used extensively in UI.
  - `end_date`: **string** (Required) - *coupons -> end_date* used extensively in UI.
  - `branch_id`: **number** (Optional, Nullable) - *coupons -> branch_id* used extensively in UI.
  - `usage_limit`: **number** (Required) - *coupons -> usage_limit* used extensively in UI.
  - `applicable_product_ids`: **array_of_undefined** (Optional) - *coupons -> applicable_product_ids* used extensively in UI.
  - `used_count`: **number** (Required) - *coupons -> used_count* used extensively in UI.
  - `description`: **string** (Required) - *coupons -> description* used extensively in UI.
  - `discount_type`: **string** (Required) - *coupons -> discount_type* used extensively in UI.
  - `discount_value`: **number** (Required) - *coupons -> discount_value* used extensively in UI.
  - `min_order_value`: **number** (Required) - *coupons -> min_order_value* used extensively in UI.
  - `max_discount_value`: **number** (Required) - *coupons -> max_discount_value* used extensively in UI.
  - `eligible_branch_ids`: **array_of_undefined** (Required) - *coupons -> eligible_branch_ids* used extensively in UI.
- **Relations:**
  - `branch_id` -> **branches** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `events`
- **Purpose**: Storage for events entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `title`: **string** (Required) - *events -> title* used extensively in UI.
  - `image`: **string** (Required) - *events -> image* used extensively in UI.
  - `description`: **string** (Required) - *events -> description* used extensively in UI.
  - `start_date`: **string** (Required) - *events -> start_date* used extensively in UI.
  - `end_date`: **string** (Required) - *events -> end_date* used extensively in UI.
  - `branches`: **array_of_number** (Required) - *events -> branches* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `event_categories`
- **Purpose**: Storage for event_categories entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `name`: **string** (Required) - *event_categories -> name* used extensively in UI.
  - `slug`: **string** (Required) - *event_categories -> slug* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `event_posts`
- **Purpose**: Storage for event_posts entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `title`: **string** (Required) - *event_posts -> title* used extensively in UI.
  - `slug`: **string** (Required) - *event_posts -> slug* used extensively in UI.
  - `category_id`: **number** (Required) - *event_posts -> category_id* used extensively in UI.
  - `thumbnail`: **string** (Required) - *event_posts -> thumbnail* used extensively in UI.
  - `thumbnail_alt`: **string** (Optional) - *event_posts -> thumbnail_alt* used extensively in UI.
  - `excerpt`: **string** (Required) - *event_posts -> excerpt* used extensively in UI.
  - `author_name`: **string** (Required) - *event_posts -> author_name* used extensively in UI.
  - `author_avatar`: **string** (Required) - *event_posts -> author_avatar* used extensively in UI.
  - `published_at`: **string** (Required) - *event_posts -> published_at* used extensively in UI.
  - `read_time`: **number** (Required) - *event_posts -> read_time* used extensively in UI.
  - `views`: **number** (Required) - *event_posts -> views* used extensively in UI.
  - `likes`: **number** (Required) - *event_posts -> likes* used extensively in UI.
  - `tags`: **array_of_string** (Required) - *event_posts -> tags* used extensively in UI.
  - `start_date`: **string** (Required) - *event_posts -> start_date* used extensively in UI.
  - `end_date`: **string** (Required) - *event_posts -> end_date* used extensively in UI.
  - `is_featured`: **boolean** (Required) - *event_posts -> is_featured* used extensively in UI.
  - `is_published`: **boolean** (Required) - *event_posts -> is_published* used extensively in UI.
  - `related_post_ids`: **array_of_number** (Required) - *event_posts -> related_post_ids* used extensively in UI.
- **Relations:**
  - `category_id` -> **event_categories** (Foreign Key)
- **Notes:**

---

### **Collection**: `post_images`
- **Purpose**: Storage for post_images entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `post_id`: **number** (Required) - *post_images -> post_id* used extensively in UI.
  - `url`: **string** (Required) - *post_images -> url* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `event_post_details`
- **Purpose**: Storage for event_post_details entities used across DataService, Redux and UI pages.
- **Fields:**
  - `post_id`: **number** (Required) - *event_post_details -> post_id* used extensively in UI.
  - `content_blocks`: **array_of_objects** (Required) - *event_post_details -> content_blocks* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `orders`
- **Purpose**: Storage for orders entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *orders -> user_id* used extensively in UI.
  - `branch_id`: **number** (Required) - *orders -> branch_id* used extensively in UI.
  - `total_amount`: **number** (Required) - *orders -> total_amount* used extensively in UI.
  - `status`: **string** (Required) - *orders -> status* used extensively in UI.
  - `delivery_type`: **string** (Required) - *orders -> delivery_type* used extensively in UI.
  - `created_at`: **string** (Required) - *orders -> created_at* used extensively in UI.
  - `items`: **array_of_objects** (Required) - *orders -> items* used extensively in UI.
  - `payment`: **object** (Required) - *orders -> payment* used extensively in UI.
    - *nested structure*: `method, status, paid_at`
  - `tracking`: **object** (Required) - *orders -> tracking* used extensively in UI.
    - *nested structure*: `status, history`
  - `qr_code_url`: **string** (Required) - *orders -> qr_code_url* used extensively in UI.
  - `shipping_fee`: **number** (Required) - *orders -> shipping_fee* used extensively in UI.
  - `discount_amount`: **number** (Required) - *orders -> discount_amount* used extensively in UI.
  - `tax_amount`: **number** (Required) - *orders -> tax_amount* used extensively in UI.
  - `subtotal`: **number** (Required) - *orders -> subtotal* used extensively in UI.
  - `payment_method`: **string** (Required) - *orders -> payment_method* used extensively in UI.
  - `payment_transaction_id`: **string** (Required) - *orders -> payment_transaction_id* used extensively in UI.
  - `is_pickup`: **boolean** (Required) - *orders -> is_pickup* used extensively in UI.
  - `vat_percent`: **number** (Required) - *orders -> vat_percent* used extensively in UI.
  - `order_address`: **object** (Required) - *orders -> order_address* used extensively in UI.
    - *nested structure*: `receiver_name, phone, full_address, lat, lng`
  - `generated_invoice_url`: **string** (Required) - *orders -> generated_invoice_url* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
  - `branch_id` -> **branches** (Foreign Key)
- **Notes:**

---

### **Collection**: `order_addresses`
- **Purpose**: Storage for order_addresses entities used across DataService, Redux and UI pages.
- **Fields:**
  - `order_id`: **number** (Required) - *order_addresses -> order_id* used extensively in UI.
  - `receiver_name`: **string** (Required) - *order_addresses -> receiver_name* used extensively in UI.
  - `phone`: **string** (Required) - *order_addresses -> phone* used extensively in UI.
  - `address`: **string** (Required) - *order_addresses -> address* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `payment_transactions`
- **Purpose**: Storage for payment_transactions entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `order_id`: **number** (Required) - *payment_transactions -> order_id* used extensively in UI.
  - `provider`: **string** (Required) - *payment_transactions -> provider* used extensively in UI.
  - `transaction_id`: **string** (Required) - *payment_transactions -> transaction_id* used extensively in UI.
  - `amount`: **number** (Required) - *payment_transactions -> amount* used extensively in UI.
  - `status`: **string** (Required) - *payment_transactions -> status* used extensively in UI.
  - `created_at`: **string** (Required) - *payment_transactions -> created_at* used extensively in UI.
- **Relations:**
  - `order_id` -> **orders** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `purchase_history`
- **Purpose**: Storage for purchase_history entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *purchase_history -> user_id* used extensively in UI.
  - `order_id`: **number** (Required) - *purchase_history -> order_id* used extensively in UI.
  - `total_amount`: **number** (Required) - *purchase_history -> total_amount* used extensively in UI.
  - `purchased_at`: **string** (Required) - *purchase_history -> purchased_at* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
  - `order_id` -> **orders** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `reviews`
- **Purpose**: Storage for reviews entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *reviews -> user_id* used extensively in UI.
  - `branch_product_id`: **number | string** (Required) - *reviews -> branch_product_id* used extensively in UI.
  - `product_id`: **number** (Required) - *reviews -> product_id* used extensively in UI.
  - `rating`: **number** (Required) - *reviews -> rating* used extensively in UI.
  - `comment`: **string** (Required) - *reviews -> comment* used extensively in UI.
  - `created_at`: **string** (Required) - *reviews -> created_at* used extensively in UI.
  - `sentiment_score`: **number** (Optional) - *reviews -> sentiment_score* used extensively in UI.
  - `user_name`: **string** (Required) - *reviews -> user_name* used extensively in UI.
  - `avatar`: **string** (Required) - *reviews -> avatar* used extensively in UI.
  - `images`: **array_of_undefined | array_of_string** (Required) - *reviews -> images* used extensively in UI.
  - `replies`: **array_of_undefined | array_of_objects** (Required) - *reviews -> replies* used extensively in UI.
  - `likes`: **number** (Required) - *reviews -> likes* used extensively in UI.
  - `status`: **string** (Required) - *reviews -> status* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
  - `product_id` -> **products** (Foreign Key)
  - `branch_product_id` -> **branch_products** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `comments`
- **Purpose**: Storage for comments entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *comments -> user_id* used extensively in UI.
  - `branch_product_id`: **number** (Required) - *comments -> branch_product_id* used extensively in UI.
  - `product_id`: **number** (Required) - *comments -> product_id* used extensively in UI.
  - `content`: **string** (Required) - *comments -> content* used extensively in UI.
  - `created_at`: **string** (Required) - *comments -> created_at* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `support_tickets`
- **Purpose**: Storage for support_tickets entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *support_tickets -> user_id* used extensively in UI.
  - `subject`: **string** (Required) - *support_tickets -> subject* used extensively in UI.
  - `status`: **string** (Required) - *support_tickets -> status* used extensively in UI.
  - `created_at`: **string** (Required) - *support_tickets -> created_at* used extensively in UI.
  - `updated_at`: **string** (Required) - *support_tickets -> updated_at* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `messages`
- **Purpose**: Storage for messages entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `ticket_id`: **string** (Required) - *messages -> ticket_id* used extensively in UI.
  - `sender_type`: **string** (Required) - *messages -> sender_type* used extensively in UI.
  - `sender_id`: **number** (Required) - *messages -> sender_id* used extensively in UI.
  - `content`: **string** (Required) - *messages -> content* used extensively in UI.
  - `created_at`: **string** (Required) - *messages -> created_at* used extensively in UI.
- **Relations:**
  - `ticket_id` -> **support_tickets** (Foreign Key)
  - `sender_id` -> **users** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `notifications`
- **Purpose**: Storage for notifications entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string | number** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *notifications -> user_id* used extensively in UI.
  - `title`: **string** (Required) - *notifications -> title* used extensively in UI.
  - `message`: **string** (Required) - *notifications -> message* used extensively in UI.
  - `created_at`: **string** (Required) - *notifications -> created_at* used extensively in UI.
  - `is_read`: **boolean** (Required) - *notifications -> is_read* used extensively in UI.
  - `type`: **string** (Required) - *notifications -> type* used extensively in UI.
  - `action_url`: **string** (Required) - *notifications -> action_url* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string | number`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `recommendation_logs`
- **Purpose**: Storage for recommendation_logs entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *recommendation_logs -> user_id* used extensively in UI.
  - `product_id`: **number** (Required) - *recommendation_logs -> product_id* used extensively in UI.
  - `score`: **number** (Required) - *recommendation_logs -> score* used extensively in UI.
  - `log_date`: **string** (Required) - *recommendation_logs -> log_date* used extensively in UI.
  - `source`: **string** (Required) - *recommendation_logs -> source* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
  - `product_id` -> **products** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `hot_deals`
- **Purpose**: Storage for hot_deals entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `title`: **string** (Required) - *hot_deals -> title* used extensively in UI.
  - `image_url`: **string** (Required) - *hot_deals -> image_url* used extensively in UI.
  - `price`: **number** (Required) - *hot_deals -> price* used extensively in UI.
  - `original_price`: **number** (Required) - *hot_deals -> original_price* used extensively in UI.
  - `valid_until`: **string** (Required) - *hot_deals -> valid_until* used extensively in UI.
- **Relations:**
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `featured_collections`
- **Purpose**: Storage for featured_collections entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `name`: **string** (Required) - *featured_collections -> name* used extensively in UI.
  - `branch_id`: **unknown** (Required, Nullable) - *featured_collections -> branch_id* used extensively in UI.
  - `branch_product_ids`: **array_of_number** (Required) - *featured_collections -> branch_product_ids* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `analytics_placeholders`
- **Purpose**: Storage for analytics_placeholders entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `type`: **string** (Required) - *analytics_placeholders -> type* used extensively in UI.
  - `from`: **string** (Required) - *analytics_placeholders -> from* used extensively in UI.
  - `to`: **string** (Required) - *analytics_placeholders -> to* used extensively in UI.
  - `data`: **object** (Required) - *analytics_placeholders -> data* used extensively in UI.
    - *nested structure*: `total`
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `promo_banners`
- **Purpose**: Storage for promo_banners entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `title`: **string** (Required) - *promo_banners -> title* used extensively in UI.
  - `description`: **string** (Required) - *promo_banners -> description* used extensively in UI.
  - `button_text`: **string** (Required) - *promo_banners -> button_text* used extensively in UI.
  - `image`: **string** (Required) - *promo_banners -> image* used extensively in UI.
  - `bg_color`: **string** (Required) - *promo_banners -> bg_color* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `home_banners`
- **Purpose**: Storage for home_banners entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `title`: **string** (Required) - *home_banners -> title* used extensively in UI.
  - `subtitle`: **string** (Required) - *home_banners -> subtitle* used extensively in UI.
  - `cta`: **string** (Required) - *home_banners -> cta* used extensively in UI.
  - `bg`: **string** (Required) - *home_banners -> bg* used extensively in UI.
  - `accent`: **string** (Required) - *home_banners -> accent* used extensively in UI.
  - `bgImage`: **string** (Required) - *home_banners -> bgImage* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `tag_colors`
- **Purpose**: Storage for tag_colors entities used across DataService, Redux and UI pages.
- **Fields:**
  - `HOT`: **string** (Required) - *tag_colors -> HOT* used extensively in UI.
  - `SALE`: **string** (Required) - *tag_colors -> SALE* used extensively in UI.
  - `LOTTE`: **string** (Required) - *tag_colors -> LOTTE* used extensively in UI.
  - `MỚI`: **string** (Required) - *tag_colors -> MỚI* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `filters`
- **Purpose**: Storage for filters entities used across DataService, Redux and UI pages.
- **Fields:**
  - `price_ranges`: **array_of_objects** (Required) - *filters -> price_ranges* used extensively in UI.
  - `brands`: **array_of_string** (Required) - *filters -> brands* used extensively in UI.
  - `ratings`: **array_of_number** (Required) - *filters -> ratings* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `home_sections`
- **Purpose**: Storage for home_sections entities used across DataService, Redux and UI pages.
- **Fields:**
  - `type`: **string** (Required) - *home_sections -> type* used extensively in UI.
  - `title`: **string** (Required) - *home_sections -> title* used extensively in UI.
  - `branch_product_ids`: **array_of_number** (Optional) - *home_sections -> branch_product_ids* used extensively in UI.
  - `hot_deal_ids`: **array_of_string** (Optional) - *home_sections -> hot_deal_ids* used extensively in UI.
  - `post_ids`: **array_of_number** (Optional) - *home_sections -> post_ids* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `product_badges`
- **Purpose**: Storage for product_badges entities used across DataService, Redux and UI pages.
- **Fields:**
  - `HOT`: **string** (Required) - *product_badges -> HOT* used extensively in UI.
  - `SALE`: **string** (Required) - *product_badges -> SALE* used extensively in UI.
  - `LOTTE`: **string** (Required) - *product_badges -> LOTTE* used extensively in UI.
  - `NEW`: **string** (Required) - *product_badges -> NEW* used extensively in UI.
  - `BEST`: **string** (Required) - *product_badges -> BEST* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `ui_settings`
- **Purpose**: Storage for ui_settings entities used across DataService, Redux and UI pages.
- **Fields:**
  - `currency`: **string** (Required) - *ui_settings -> currency* used extensively in UI.
  - `product_card`: **object** (Required) - *ui_settings -> product_card* used extensively in UI.
    - *nested structure*: `show_rating, show_sold_count, show_badges`
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `product_policies`
- **Purpose**: Storage for product_policies entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `icon`: **string** (Required) - *product_policies -> icon* used extensively in UI.
  - `title`: **string** (Required) - *product_policies -> title* used extensively in UI.
  - `description`: **string** (Required) - *product_policies -> description* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `related_products`
- **Purpose**: Storage for related_products entities used across DataService, Redux and UI pages.
- **Fields:**
  - `1`: **array_of_number** (Required) - *related_products -> 1* used extensively in UI.
  - `2`: **array_of_number** (Required) - *related_products -> 2* used extensively in UI.
  - `7`: **array_of_number** (Required) - *related_products -> 7* used extensively in UI.
  - `8`: **array_of_number** (Required) - *related_products -> 8* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `frequently_bought_together`
- **Purpose**: Storage for frequently_bought_together entities used across DataService, Redux and UI pages.
- **Fields:**
  - `product_id`: **number** (Required) - *frequently_bought_together -> product_id* used extensively in UI.
  - `with`: **array_of_number** (Required) - *frequently_bought_together -> with* used extensively in UI.
  - `combo_price`: **number** (Required) - *frequently_bought_together -> combo_price* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `loyalty_transactions`
- **Purpose**: Storage for loyalty_transactions entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *loyalty_transactions -> user_id* used extensively in UI.
  - `points`: **number** (Required) - *loyalty_transactions -> points* used extensively in UI.
  - `type`: **string** (Required) - *loyalty_transactions -> type* used extensively in UI.
  - `source`: **string** (Required) - *loyalty_transactions -> source* used extensively in UI.
  - `created_at`: **string** (Required) - *loyalty_transactions -> created_at* used extensively in UI.
  - `reference_id`: **string** (Required) - *loyalty_transactions -> reference_id* used extensively in UI.
- **Relations:**
  - `user_id` -> **users** (Foreign Key)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `product_search_index`
- **Purpose**: Storage for product_search_index entities used across DataService, Redux and UI pages.
- **Fields:**
  - `product_id`: **number** (Required) - *product_search_index -> product_id* used extensively in UI.
  - `keywords`: **array_of_string** (Required) - *product_search_index -> keywords* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `event_filters`
- **Purpose**: Storage for event_filters entities used across DataService, Redux and UI pages.
- **Fields:**
  - `chips`: **array_of_objects** (Required) - *event_filters -> chips* used extensively in UI.
  - `default_active`: **string** (Required) - *event_filters -> default_active* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `event_comments`
- **Purpose**: Storage for event_comments entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `post_id`: **number** (Required) - *event_comments -> post_id* used extensively in UI.
  - `user_id`: **number** (Required) - *event_comments -> user_id* used extensively in UI.
  - `user_name`: **string** (Required) - *event_comments -> user_name* used extensively in UI.
  - `avatar`: **string** (Required) - *event_comments -> avatar* used extensively in UI.
  - `content`: **string** (Required) - *event_comments -> content* used extensively in UI.
  - `created_at`: **string** (Required) - *event_comments -> created_at* used extensively in UI.
  - `likes`: **number** (Required) - *event_comments -> likes* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `event_tags`
- **Purpose**: Storage for event_tags entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **number** (Required) - *Primary Key* used extensively in UI.
  - `name`: **string** (Required) - *event_tags -> name* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**

---

### **Collection**: `featured_events`
- **Purpose**: Storage for featured_events entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `post_id`: **number** (Required) - *featured_events -> post_id* used extensively in UI.
  - `priority`: **number** (Required) - *featured_events -> priority* used extensively in UI.
  - `layout`: **string** (Required) - *featured_events -> layout* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `payment_methods`
- **Purpose**: Storage for payment_methods entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *payment_methods -> user_id* used extensively in UI.
  - `type`: **string** (Required) - *payment_methods -> type* used extensively in UI.
  - `last4`: **string** (Required) - *payment_methods -> last4* used extensively in UI.
  - `brand`: **string** (Required) - *payment_methods -> brand* used extensively in UI.
  - `expiry`: **string** (Optional) - *payment_methods -> expiry* used extensively in UI.
  - `holder_name`: **string** (Required) - *payment_methods -> holder_name* used extensively in UI.
  - `is_default`: **boolean** (Required) - *payment_methods -> is_default* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

### **Collection**: `coupon_usage`
- **Purpose**: Storage for coupon_usage entities used across DataService, Redux and UI pages.
- **Fields:**
  - `id`: **string** (Required) - *Primary Key* used extensively in UI.
  - `user_id`: **number** (Required) - *coupon_usage -> user_id* used extensively in UI.
  - `coupon_id`: **string** (Required) - *coupon_usage -> coupon_id* used extensively in UI.
  - `used_at`: **string** (Required) - *coupon_usage -> used_at* used extensively in UI.
- **Relations:**
  - (No explicit foreign keys found or defined)
- **Notes:**
  - **WARNING**: ID type is `string`. Be careful when checking equality (e.g. `id === 1`).

---

## 3. Summary
- **Total Collections / Tables:** 57
- **Total Unique Fields Mapped:** 409
- **Collection with Most Data:** `branch_products` (13 records)
- **Closely Related Collections:** `users`, `products`, `branch_products`, `orders` form the core e-commerce lifecycle.
- **Collections to Potentially Merge:** 
   - `product_images`, `ar_models` could be merged into `products` as array fields.
   - `home_banners`, `promo_banners` could be unified into a `banners` table with a `type` field.
- **Standardization Needs:** Many relations reference `product_id` vs `branch_product_id` inconsistently across different features (e.g., wishlists, tracking). A unified approach is recommended for future backend design.
