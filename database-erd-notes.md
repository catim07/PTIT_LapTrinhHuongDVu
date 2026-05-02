# Database ERD Notes

Generated artifact:
- database-erd.drawio

Pages:
1. Core User / Auth / Catalog / Order
2. Promotions / Payment / Loyalty
3. CX / Support / Review / Notification / History / Wishlist
4. Admin Inventory / Supplier / Import / Stock / Batch

Important drift/legacy annotations shown directly in diagram:
- BranchProduct has frontend/sample fields not in schema: badges, policies, lead_time_days, status, last_updated.
- Order uses both nested payment object and legacy flat fields in frontend/sample: payment_method, payment_status, payment_transaction_id, vat_percent, vat_amount, tax_amount, is_pickup, qr_code_url.
- Product alias pairs: rating/average_rating, origin/origin_country, storage_instructions/storage_guide.
- Coupon alias pairs: discount_value/value, min_order_amount/min_order_value, max_discount_amount/max_discount_value.
- Notification alias pair: link/action_url.
- Branch alias pair: operating_hours/opening_hours.
- Promotion schema has duplicated scope/target fields.
- StockMovement exists as canonical model and a duplicate legacy variant in Misc.
- FlashDeal is alias model over HotDeal schema/collection.

Legend in diagram:
- PK, FK, UQ, OPT, DEF(x), IDX(...)
- Tags: snapshot, denorm, computed, legacy, mixed, ambiguous, observed-in-db, frontend-used, alias
