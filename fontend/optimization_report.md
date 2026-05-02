# Lotte Mart MockData Optimization Report

## 1. Collection Decision Report
### Removed Collections (Confirmed Unused)
- `analytics_placeholders`
- `tag_colors`
- `product_badges`
- `ui_settings`
- `event_filters`
- `product_search_index`
- `recommendation_logs`
- `frequently_bought_together`
- `home_sections`
- `post_images`
- `roles`
- `otp_logs`
- `notification_subscriptions`
- `product_images`
- `ar_models`
- `branches`
- `inventory_transactions`
- `wishlists`
- `product_questions`
- `search_history`
- `order_addresses`
- `purchase_history`
- `event_tags`
- `event_post_details`

### Merged Collections
- `event_post_details -> event_posts`

### Kept Collections
- `database`
- `filters`
- `related_products`
- `users`
- `auth_tokens`
- `categories`
- `products`
- `branch_products`
- `delivery_slots`
- `user_addresses`
- `carts`
- `promotions`
- `coupons`
- `events`
- `event_categories`
- `event_posts`
- `orders`
- `payment_transactions`
- `reviews`
- `comments`
- `support_tickets`
- `messages`
- `notifications`
- `hot_deals`
- `featured_collections`
- `promo_banners`
- `home_banners`
- `product_policies`
- `loyalty_transactions`
- `event_comments`
- `featured_events`
- `payment_methods`
- `coupon_usage`

## 2. Field Decision Report
- **`products.images`**: Consolidated all `product_images` entries into this array for a single source of truth.
- **`products.ar_model_url`**: Consolidated `ar_models` directly into products.
- **`orders.order_address`**: Absorbed `order_addresses` directly into the order object (already required by frontend types).
- **`event_posts.content_blocks`**: Absorbed `event_post_details` directly into the post objects.

## 3. Relation Map & Normalization
- Normalized `products.id` and `branch_products.product_id` to strictly **Number** to prevent mismatch errors.
- Removed orphaned reference tables that are no longer queried separately by DataService or UI.

## 4. Merge Plan Executed
- **event_post_details -> event_posts**: Safe merge executed. The UI naturally expects these entities as nested objects (e.g. `order.order_address`).

## 5. Compatibility Notes
- Collections like `reviews` and `comments` remain separate as they serve different UI contexts (product page vs event posts).
- `home_banners` and `promo_banners` remain separate as the frontend strictly queries `getHomeBanners` and `getPromoBanners` individually.
- `support_tickets` and `messages` remain separated to model a standard ticketing system relation, as messages grow over time.
