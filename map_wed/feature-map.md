# Feature Map Re-Audit (Synced To Data Fidelity)

## 1. Status Legend
- ✅ Implemented and data contract aligned.
- ⚠️ Implemented but payload/schema drift exists.
- ❌ Missing or non-functional.

## 2. User Features
| Feature | Status | Data-Model Note |
|---|---|---|
| Product browse/search/detail | ✅ | Product schema now includes rich detail fields used by FE.
| Product detail highlights/spec tables/rating histogram | ✅ | `highlights`, `specifications`, `rating_breakdown`, `total_reviews` now schema-backed.
| Eco filtering in listing/search | ✅ | `eco_label` now schema-backed.
| Cart by branch | ✅ | Cart + BranchProduct core fields aligned.
| Checkout/order/payment flow | ⚠️ | Works, but order sample aliases (tax/pickup/payment fields) are not canonical schema fields.
| Promotions/coupons wallet claim | ⚠️ | Works, but sample key naming drift (`value`, `min_order`) still exists.
| Viewed history merge | ✅ | Unique composite dedupe and FE merge flow aligned.
| Reviews and product review summary | ⚠️ | Works, but sample has `comment/replies` alias vs schema `content/reply`.
| Support ticket chat realtime | ⚠️ | Runtime works, sample docs are under-modeled relative to schema richness.
| User settings/security/privacy preferences | ✅ | User schema now includes `settings`, `security`, `profile_completed`, `wallet_balance`.
| Contact page | ❌ | page remains empty/unrouted.

## 3. Admin Features
| Feature | Status | Data-Model Note |
|---|---|---|
| Product/category management | ✅ | Category schema aligned with `description/display_order`; sort alias still mixed.
| Campaign management (promotion/coupon/banner/flash deal) | ⚠️ | Functional, but Promotion schema has duplicate field declarations.
| Orders/customers/reviews management | ✅ | major entities mapped.
| RBAC roles/permissions | ✅ | Role + Permission models aligned with admin guard usage.
| System settings | ✅ | API + UI active.
| Supplier/import/inventory/stock movement | ✅ | enterprise models exist and are usable.
| Stock takes/internal requisitions | ⚠️ | endpoints are placeholder/static.

## 4. Enterprise And Inventory Features
| Feature | Status | Data-Model Note |
|---|---|---|
| Supplier master | ✅ | full schema and admin services aligned.
| Import order lifecycle | ✅ | timeline/items modeled.
| Import receipt and batch tracking | ✅ | receipt and batch schemas aligned.
| Stock movement reporting | ⚠️ | duplicate StockMovement schema in Misc remains a risk.

## 5. Authentication Features
| Feature | Status | Data-Model/API Note |
|---|---|---|
| Email/password login + refresh | ✅ | aligned.
| Email OTP verification | ✅ | aligned.
| OAuth Google/Facebook | ✅ | aligned.
| Phone OTP login | ❌ | FE endpoint contract exists; BE route missing.
| Forgot/reset password UX | ⚠️ | backend routes exist; FE flow not fully implemented.

## 6. Feature-Level Drift Summary
1. BranchProduct FE-visible sample fields (`badges`, `policies`, `lead_time_days`, `status`, `last_updated`) are not schema-defined.
2. Order sample payload contains tax/pickup aliases not modeled directly in schema.
3. Notification payload naming (`action_url` vs `link`) still drifts.
4. Promotion schema duplication and StockMovement duplication still unresolved.

## 7. What Changed In This Re-Audit
- Product/User/Category data contracts are now far closer to full-fidelity usage.
- Seed path now preserves these fields into Mongo instead of dropping them.
- Documentation now explicitly tracks field provenance and drift, not only endpoint existence.
