# FEATURE AUDIT (ADMIN + USER)

## Scope
- Frontend scanned: [fontend/src/App.tsx](fontend/src/App.tsx#L1), [fontend/src/pages](fontend/src/pages), [fontend/src/admin/pages](fontend/src/admin/pages), [fontend/src/services](fontend/src/services), [fontend/src/api/endpoints.ts](fontend/src/api/endpoints.ts#L1).
- Backend scanned: [backend/app.js](backend/app.js#L93), [backend/routes](backend/routes), [backend/controllers](backend/controllers).
- Rule used: only mark based on real code path, route, and API wiring found in source.

## Legend
- ✅ Implemented and connected FE + BE.
- ⚠️ Exists but incomplete/partially wired/risky.
- ❌ Missing or non-functional.

## USER FEATURES

| Feature | Frontend | Backend | Status | Evidence |
|---|---|---|---|---|
| Browse products, home, product detail, search | Routes and pages exist | Product/category/branch routes mounted | ✅ | [fontend/src/App.tsx](fontend/src/App.tsx#L165), [backend/app.js](backend/app.js#L94) |
| Compare products (table) | Compare page + compare bar + compare service | Compare routes/controller | ✅ | [fontend/src/App.tsx](fontend/src/App.tsx#L169), [fontend/src/pages/Compare.tsx](fontend/src/pages/Compare.tsx#L1), [backend/routes/compare.js](backend/routes/compare.js#L1) |
| Promotions/Coupons wallet and claim | Promotions page + services + endpoints | Promotions/coupons routes mounted | ✅ | [fontend/src/pages/Promotions.tsx](fontend/src/pages/Promotions.tsx#L1), [fontend/src/api/endpoints.ts](fontend/src/api/endpoints.ts#L207), [backend/app.js](backend/app.js#L105) |
| Events list/detail/featured | Routes and pages exist | Events route mounted | ✅ | [fontend/src/App.tsx](fontend/src/App.tsx#L175), [backend/app.js](backend/app.js#L107) |
| Cart management | Protected cart route + cart slice/service | Cart route mounted | ✅ | [fontend/src/App.tsx](fontend/src/App.tsx#L185), [backend/app.js](backend/app.js#L96) |
| Account area: profile/orders/addresses/coupons/payments/loyalty/reviews/support/settings/notifications | Full protected account routes | Corresponding API route groups mounted | ✅ | [fontend/src/App.tsx](fontend/src/App.tsx#L194), [backend/app.js](backend/app.js#L99) |
| Contact page | File exists but empty, no route wiring found | No dedicated contact route group | ❌ | [fontend/src/pages/Contact.tsx](fontend/src/pages/Contact.tsx), [fontend/src/App.tsx](fontend/src/App.tsx#L165) |
| Hot deals dedicated page | File exists but empty; no dedicated page route | Hot deals APIs exist | ⚠️ | [fontend/src/pages/HotDeals.tsx](fontend/src/pages/HotDeals.tsx), [backend/app.js](backend/app.js#L136) |

## ADMIN FEATURES

| Feature | Frontend | Backend | Status | Evidence |
|---|---|---|---|---|
| Admin auth/login and guard | Admin login + guard + admin layout routes | Admin auth login/verify endpoints | ✅ | [fontend/src/App.tsx](fontend/src/App.tsx#L211), [backend/routes/admin.js](backend/routes/admin.js#L14) |
| Dashboard analytics | Admin dashboard route | Admin analytics endpoint | ✅ | [fontend/src/App.tsx](fontend/src/App.tsx#L216), [backend/routes/admin.js](backend/routes/admin.js#L124) |
| Product/category/customer/order/review management | Admin pages wired in router | Products/categories/users/orders/reviews route groups | ✅ | [fontend/src/App.tsx](fontend/src/App.tsx#L217), [backend/app.js](backend/app.js#L94) |
| Coupon/promotion/banner/flash deal management | Admin pages and services present | Promotions/coupons/banners/flash-deals mounted | ✅ | [fontend/src/App.tsx](fontend/src/App.tsx#L220), [backend/app.js](backend/app.js#L105), [backend/app.js](backend/app.js#L127) |
| Supplier/import/inventory/stock movement | Admin pages wired | Suppliers/import/inventory/stock movement routes mounted | ✅ | [fontend/src/App.tsx](fontend/src/App.tsx#L227), [backend/app.js](backend/app.js#L122) |
| Roles/permissions and audit logs | Admin routes with permission guard | Roles/permissions/audit routes mounted | ✅ | [fontend/src/App.tsx](fontend/src/App.tsx#L232), [backend/app.js](backend/app.js#L114) |
| System settings (general/payment/notification) | Admin settings page loads/saves settings | Admin settings + notification template routes | ✅ | [fontend/src/admin/pages/AdminSystemSettings.tsx](fontend/src/admin/pages/AdminSystemSettings.tsx#L21), [backend/routes/admin.js](backend/routes/admin.js#L70) |
| Admin change password from settings page | UI action exists but mocked only | No matching admin password-change API call in page | ⚠️ | [fontend/src/admin/pages/AdminSystemSettings.tsx](fontend/src/admin/pages/AdminSystemSettings.tsx#L90), [fontend/src/admin/pages/AdminSystemSettings.tsx](fontend/src/admin/pages/AdminSystemSettings.tsx#L93) |
| Stock take and internal requisition operations | Service methods exist in data layer only | Placeholder APIs returning static payloads | ⚠️ | [fontend/src/services/dataService.ts](fontend/src/services/dataService.ts#L916), [backend/routes/stockTakes.js](backend/routes/stockTakes.js#L6), [backend/routes/internalRequisitions.js](backend/routes/internalRequisitions.js#L6) |

## AUTH FEATURES

| Feature | Frontend | Backend | Status | Evidence |
|---|---|---|---|---|
| Register/login with email-password | Auth slice + auth service + pages | Auth routes register/login | ✅ | [fontend/src/pages/Login.tsx](fontend/src/pages/Login.tsx#L1), [fontend/src/pages/Register.tsx](fontend/src/pages/Register.tsx#L1), [backend/routes/auth.js](backend/routes/auth.js#L73) |
| Google login | Frontend thunk/service | Backend google route | ✅ | [fontend/src/services/authService.ts](fontend/src/services/authService.ts#L95), [backend/routes/auth.js](backend/routes/auth.js#L76) |
| Facebook OAuth login | Frontend redirect and callback handling | Backend facebook + callback routes | ✅ | [fontend/src/services/authService.ts](fontend/src/services/authService.ts#L115), [backend/routes/auth.js](backend/routes/auth.js#L78) |
| Email OTP verification flow | Register page resend/verify email OTP | Email OTP routes present | ✅ | [fontend/src/pages/Register.tsx](fontend/src/pages/Register.tsx#L222), [backend/routes/auth.js](backend/routes/auth.js#L157) |
| Phone OTP login flow | Login page + auth slice call sendOTP/verifyOTP | No /auth/otp/send and /auth/otp/verify in route file | ❌ | [fontend/src/pages/Login.tsx](fontend/src/pages/Login.tsx#L207), [fontend/src/api/endpoints.ts](fontend/src/api/endpoints.ts#L11), [backend/routes/auth.js](backend/routes/auth.js#L157) |
| Forgot/reset password | Endpoint constants exist, service hardcoded NOT_IMPLEMENTED | Backend routes exist | ❌ | [fontend/src/services/authService.ts](fontend/src/services/authService.ts#L238), [backend/routes/auth.js](backend/routes/auth.js#L166) |
| Refresh/logout/logout-all/profile summary | FE service methods + auth slice uses verify session | Backend refresh/logout/logout-all/profile routes | ✅ | [fontend/src/services/authService.ts](fontend/src/services/authService.ts#L171), [backend/routes/auth.js](backend/routes/auth.js#L160) |

## AI FEATURES

| Feature | Frontend | Backend | Status | Evidence |
|---|---|---|---|---|
| AI summary for compare page | Compare page checks status and calls summarize API | Compare controller + AI summary service integration | ✅ | [fontend/src/pages/Compare.tsx](fontend/src/pages/Compare.tsx#L110), [fontend/src/services/compareService.ts](fontend/src/services/compareService.ts#L99), [backend/controllers/compareController.js](backend/controllers/compareController.js#L1) |
| AI readiness handling and quota/model errors | Frontend status + fallback messaging | Backend returns explicit AI_NOT_READY/QUOTA/MODEL errors | ✅ | [fontend/src/services/compareService.ts](fontend/src/services/compareService.ts#L142), [backend/controllers/compareController.js](backend/controllers/compareController.js#L221) |
| Additional AI modules (recommendation/chatbot/assistant) | Not found in current frontend routing/services | Not found in backend route map | ❌ | [fontend/src/App.tsx](fontend/src/App.tsx#L165), [backend/app.js](backend/app.js#L93) |

## PAYMENT / ORDER / CART

| Feature | Frontend | Backend | Status | Evidence |
|---|---|---|---|---|
| Payment method CRUD and default method | Payment service/data service + account payment page route | Payment methods endpoints | ✅ | [fontend/src/services/paymentService.ts](fontend/src/services/paymentService.ts#L1), [fontend/src/App.tsx](fontend/src/App.tsx#L199), [backend/routes/payments.js](backend/routes/payments.js#L5) |
| Payment process/confirm/status (QR flow) | Payment page creates transaction and confirms payment | Payment controller process/confirm/status | ✅ | [fontend/src/pages/Payment.tsx](fontend/src/pages/Payment.tsx#L107), [backend/controllers/paymentController.js](backend/controllers/paymentController.js#L89) |
| Order create/list/detail/cancel/tracking/reorder/invoice | Order service/data service + account/admin pages | Orders route/controller supports all listed actions | ✅ | [fontend/src/services/orderService.ts](fontend/src/services/orderService.ts#L1), [backend/routes/orders.js](backend/routes/orders.js#L6) |
| Checkout totals calculation | Frontend uses promotion calculation endpoint in checkout/cart | Backend has promotions + checkout endpoints | ✅ | [fontend/src/pages/Checkout.tsx](fontend/src/pages/Checkout.tsx#L183), [fontend/src/services/promotionService.ts](fontend/src/services/promotionService.ts#L65), [backend/routes/checkout.js](backend/routes/checkout.js#L1) |
| Backend create-from-cart + checkout preview/calculate direct APIs | FE service wrappers exist but no page-level usage found | Backend routes exist | ⚠️ | [fontend/src/services/orderService.ts](fontend/src/services/orderService.ts#L8), [backend/routes/orders.js](backend/routes/orders.js#L7), [backend/routes/checkout.js](backend/routes/checkout.js#L7) |
| Payment safety gates (email verified and valid phone for payment) | Frontend blocks payment if email not verified | Backend blocks payment if phone invalid | ✅ | [fontend/src/pages/Payment.tsx](fontend/src/pages/Payment.tsx#L118), [backend/controllers/paymentController.js](backend/controllers/paymentController.js#L99) |

## MISSING / INCOMPLETE MATRIX

### UI exists but no logic (or no usable flow)
- ❌ Contact page is empty: [fontend/src/pages/Contact.tsx](fontend/src/pages/Contact.tsx).
- ⚠️ Hot deals page file is empty and no dedicated route for standalone listing page: [fontend/src/pages/HotDeals.tsx](fontend/src/pages/HotDeals.tsx), [fontend/src/App.tsx](fontend/src/App.tsx#L165).
- ⚠️ Admin password change in settings is mock toast, not real API flow: [fontend/src/admin/pages/AdminSystemSettings.tsx](fontend/src/admin/pages/AdminSystemSettings.tsx#L93).

### Backend exists but frontend not connected (or only partially connected)
- ⚠️ Backend checkout routes exist but checkout page computes via promotions route, not checkout route wrappers: [backend/routes/checkout.js](backend/routes/checkout.js#L7), [fontend/src/services/orderService.ts](fontend/src/services/orderService.ts#L10), [fontend/src/pages/Checkout.tsx](fontend/src/pages/Checkout.tsx#L183).
- ⚠️ Order create-from-cart API exists but flow currently creates order via createOrder path in payment page: [backend/routes/orders.js](backend/routes/orders.js#L7), [fontend/src/pages/Payment.tsx](fontend/src/pages/Payment.tsx#L264), [fontend/src/services/orderService.ts](fontend/src/services/orderService.ts#L8).

### Logic missing or placeholder
- ❌ Stock take and internal requisition APIs are placeholder returns: [backend/routes/stockTakes.js](backend/routes/stockTakes.js#L6), [backend/routes/internalRequisitions.js](backend/routes/internalRequisitions.js#L6).
- ⚠️ Search history and purchase history APIs return static empty arrays in app bootstrap: [backend/app.js](backend/app.js#L142).

### Feature not present
- ❌ End-to-end forgot/reset password UI flow not implemented on frontend although backend routes exist: [fontend/src/services/authService.ts](fontend/src/services/authService.ts#L238), [backend/routes/auth.js](backend/routes/auth.js#L166).
- ❌ Phone OTP login endpoints mismatch (frontend expects route names not implemented in backend): [fontend/src/api/endpoints.ts](fontend/src/api/endpoints.ts#L11), [backend/routes/auth.js](backend/routes/auth.js#L157).

## BUGS FOUND

### High
- ❌ Phone OTP login is broken due endpoint contract mismatch.
Evidence: [fontend/src/api/endpoints.ts](fontend/src/api/endpoints.ts#L11), [fontend/src/slices/authSlice.ts](fontend/src/slices/authSlice.ts#L148), [backend/routes/auth.js](backend/routes/auth.js#L157).

- ❌ Security risk: hardcoded auto-create admin account and default password in runtime login path.
Evidence: [backend/routes/admin.js](backend/routes/admin.js#L24), [backend/routes/admin.js](backend/routes/admin.js#L27).

### Medium
- ⚠️ Forgot/reset password on FE returns NOT_IMPLEMENTED while BE routes already exist.
Evidence: [fontend/src/services/authService.ts](fontend/src/services/authService.ts#L238), [backend/routes/auth.js](backend/routes/auth.js#L166).

- ⚠️ Placeholder enterprise endpoints can make admin inventory audits/requisitions appear implemented while returning dummy payloads.
Evidence: [backend/routes/stockTakes.js](backend/routes/stockTakes.js#L6), [backend/routes/internalRequisitions.js](backend/routes/internalRequisitions.js#L6).

- ⚠️ Search/purchase history API currently hardcoded empty response.
Evidence: [backend/app.js](backend/app.js#L142).

- ⚠️ Admin settings password change is mock-only action.
Evidence: [fontend/src/admin/pages/AdminSystemSettings.tsx](fontend/src/admin/pages/AdminSystemSettings.tsx#L93).

### Low
- ⚠️ Endpoint drift in frontend users endpoint map includes nested resources not present in users route file.
Evidence: [fontend/src/api/endpoints.ts](fontend/src/api/endpoints.ts#L45), [backend/routes/users.js](backend/routes/users.js#L1).

- ⚠️ Multiple empty source files indicate unfinished or abandoned modules.
Evidence: [fontend/src/pages/Contact.tsx](fontend/src/pages/Contact.tsx), [fontend/src/pages/HotDeals.tsx](fontend/src/pages/HotDeals.tsx), [fontend/src/apis/index.ts](fontend/src/apis/index.ts).

## RECOMMENDED FEATURES / PRIORITY PLAN

### P0 (fix immediately)
1. Unify OTP contract: either implement [backend/routes/auth.js](backend/routes/auth.js#L157) equivalents for /auth/otp/send + /auth/otp/verify, or switch frontend to existing email OTP flow only.
2. Remove hardcoded admin bootstrap credentials from login route and move bootstrap to one-time secure seed script.

### P1 (close functional gaps)
1. Implement real forgot/reset password UI and wire to [backend/routes/auth.js](backend/routes/auth.js#L166).
2. Replace placeholder stock take/requisition APIs with real controller/model logic and permission checks.
3. Implement real search history/purchase history persistence instead of static returns.

### P2 (consistency and maintainability)
1. Align [fontend/src/api/endpoints.ts](fontend/src/api/endpoints.ts#L45) with actual backend route contracts to avoid dead calls.
2. Remove or complete empty/deprecated files to reduce audit noise and onboarding confusion.
3. Decide one checkout pricing path (checkout controller vs promotions calculate) and standardize service usage.

## Overall Assessment
- USER surface: mostly complete with a few missing pages and auth-flow gaps.
- ADMIN surface: broad and strong, but contains placeholder enterprise modules and one mock security setting action.
- AUTH reliability: mixed due OTP mismatch and missing forgot/reset implementation.
- PAYMENT/ORDER/CART: generally solid and production-shaped, with good validation and transaction handling.
