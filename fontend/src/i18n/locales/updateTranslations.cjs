const fs = require('fs');

const updateLocale = (lang, updates) => {
  const path = `./${lang}.json`;
  let data = {};
  if (fs.existsSync(path)) {
    data = JSON.parse(fs.readFileSync(path, 'utf8'));
  }

  // Deep merge
  const merge = (target, source) => {
    for (const key of Object.keys(source)) {
      if (source[key] instanceof Object && key in target) {
        Object.assign(source[key], merge(target[key], source[key]));
      }
    }
    Object.assign(target || {}, source);
    return target;
  };

  merge(data, updates[lang]);
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
};

const updates = {
  en: {
    cart: {
      sku: "SKU:",
      categoryLabel: "Category:",
      supplierLabel: "Supplier:",
      expiryDate: "Expiry: {{date}}",
      expired: "EXPIRED",
      expiringSoon: "EXPIRING SOON",
      giftIncluded: "Included Gift",
      quantityLabel: "Quantity: {{count}}",
      freeGift: "Free",
      couponsRemaining: "Coupons remaining",
      couponUsedUp: "This coupon is fully used up.",
      couponExpired: "This coupon has expired.",
      couponAppliedText: "Applied code: {{code}}",
      freeShippingFor: "Free shipping for orders over",
      maxLimitReached: "Max limit of {{max}} reached"
    },
    profile: {
      viewedHistory: "Viewed History",
      clearAll: "Clear All",
      clearAllConfirm: "Are you sure you want to clear all?",
      delete: "Delete",
      noWishlist: "No products in your wishlist.",
      noViewedHistory: "No products in your viewed history.",
      loadWishlistError: "Cannot load wishlist",
      removeWishlistSuccess: "Removed from wishlist",
      removeWishlistError: "Failed to remove from wishlist",
      clearWishlistSuccess: "Cleared all wishlist items",
      clearWishlistError: "Failed to clear wishlist",
      noBranchData: "Product has no data for this branch",
      viewedAt: "Viewed: {{date}}",
      loadHistoryError: "Cannot load history. Please try again.",
      removeHistorySuccess: "Removed from history",
      removeHistoryError: "Failed to remove from history",
      clearHistoryConfirm: "Are you sure you want to clear all history?",
      clearHistorySuccess: "Cleared all viewed history",
      clearHistoryError: "Failed to clear viewed history",
      loadingHistory: "Loading viewed history...",
      reload: "Reload",
      temporaryOutOfStock: "Temporarily out of stock",
      inStockCount: "In stock: {{count}}"
    },
    orders: {
      myOrders: "My Orders",
      all: "All",
      shipping: "Shipping",
      completed: "Completed",
      cancelled: "Cancelled",
      loading: "Loading orders...",
      noOrders: "No orders found.",
      orderId: "Order #{{id}}",
      itemsCount: "{{count}} items",
      viewDetail: "View Order Details",
      status: {
        CONFIRMED: "CONFIRMED",
        COMPLETED: "COMPLETED",
        DELIVERED: "DELIVERED",
        CANCELLED: "CANCELLED",
        RETURNED: "RETURNED",
        PROCESSING: "PROCESSING",
        SHIPPING: "SHIPPING",
        PENDING: "PENDING"
      }
    }
  },
  ja: {
    cart: {
      sku: "SKU:",
      categoryLabel: "カテゴリー:",
      supplierLabel: "サプライヤー:",
      expiryDate: "有効期限: {{date}}",
      expired: "期限切れ",
      expiringSoon: "もうすぐ期限切れ",
      giftIncluded: "無料ギフト",
      quantityLabel: "数量: {{count}}",
      freeGift: "無料",
      couponsRemaining: "残りクーポン",
      couponUsedUp: "このクーポンは使い切りました。",
      couponExpired: "このクーポンは期限切れです。",
      couponAppliedText: "適用されたコード: {{code}}",
      freeShippingFor: "送料無料の条件：",
      maxLimitReached: "最大 {{max}} 個まで"
    },
    profile: {
      viewedHistory: "閲覧履歴",
      clearAll: "すべてクリア",
      clearAllConfirm: "すべてクリアしますか？",
      delete: "削除",
      noWishlist: "ウィッシュリストに商品がありません。",
      noViewedHistory: "閲覧履歴に商品がありません。",
      loadWishlistError: "ウィッシュリストを読み込めません",
      removeWishlistSuccess: "ウィッシュリストから削除しました",
      removeWishlistError: "削除に失敗しました",
      clearWishlistSuccess: "ウィッシュリストをクリアしました",
      clearWishlistError: "クリアに失敗しました",
      noBranchData: "この店舗には商品データがありません",
      viewedAt: "閲覧日時: {{date}}",
      loadHistoryError: "履歴を読み込めません。再試行してください。",
      removeHistorySuccess: "履歴から削除しました",
      removeHistoryError: "削除に失敗しました",
      clearHistoryConfirm: "閲覧履歴をすべてクリアしますか？",
      clearHistorySuccess: "閲覧履歴をクリアしました",
      clearHistoryError: "クリアに失敗しました",
      loadingHistory: "閲覧履歴を読み込み中...",
      reload: "再読み込み",
      temporaryOutOfStock: "一時的に在庫切れ",
      inStockCount: "在庫: {{count}}"
    },
    orders: {
      myOrders: "私の注文",
      all: "すべて",
      shipping: "配送中",
      completed: "完了",
      cancelled: "キャンセル済み",
      loading: "注文を読み込み中...",
      noOrders: "注文が見つかりません。",
      orderId: "注文番号 #{{id}}",
      itemsCount: "{{count}} 個の商品",
      viewDetail: "注文の詳細を見る",
      status: {
        CONFIRMED: "確認済み",
        COMPLETED: "完了",
        DELIVERED: "配達済み",
        CANCELLED: "キャンセル済み",
        RETURNED: "返品済み",
        PROCESSING: "処理中",
        SHIPPING: "配送中",
        PENDING: "保留中"
      }
    }
  }
};

updateLocale('en', updates);
updateLocale('ja', updates);
console.log('Translations updated.');
