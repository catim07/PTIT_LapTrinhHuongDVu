const fs = require('fs');
const path = require('path');

const DIR = 'c:/Users/LE THANH CUONG/OneDrive/Desktop/Lotte_Mart_Project/fontend/src/pages';

const dict = [
  // SearchResults
  { v: />Kết quả tìm kiếm</g, r: ">{t('search.title', 'Kết quả tìm kiếm')}<" },
  { v: /Đang tìm kiếm sản phẩm\.\.\./g, r: "{t('search.searching', 'Đang tìm kiếm sản phẩm...')}" },
  { v: />Mới nhất</g, r: ">{t('product.newest')}<" },
  { v: />Bán chạy</g, r: ">{t('product.bestSeller')}<" },
  { v: />Giá: Thấp đến Cao</g, r: ">{t('product.priceLowToHigh')}<" },
  { v: />Giá: Cao đến Thấp</g, r: ">{t('product.priceHighToLow')}<" },
  { v: />Đánh giá tốt nhất</g, r: ">{t('product.highestRated')}<" },
  { v: />Danh mục</g, r: ">{t('product.category')}<" },
  { v: />Khoảng giá</g, r: ">{t('search.priceRange', 'Khoảng giá')}<" },
  { v: />Dưới 50\.000đ</g, r: ">{t('search.under50k', 'Dưới 50.000đ')}<" },
  { v: />Trên 200\.000đ</g, r: ">{t('search.above200k', 'Trên 200.000đ')}<" },
  { v: /Không tìm thấy sản phẩm nào phù hợp với từ khóa/g, r: "{t('search.noResultsMatch', 'Không tìm thấy sản phẩm nào phù hợp với từ khóa')}" },
  { v: /Không tìm thấy sản phẩm nào/g, r: "{t('common.noResults')}" },

  // Cart & Checkout & Payment
  { v: /Vui lòng chờ trong giây lát\.\.\./g, r: "{t('common.pleaseWait', 'Vui lòng chờ trong giây lát...')}" },
  { v: />Chưa chọn chi nhánh</g, r: ">{t('cart.noBranchSelected', 'Chưa chọn chi nhánh')}<" },
  { v: /Mã giảm giá không hợp lệ/g, r: "t('cart.invalidCoupon')" },
  { v: />Sản phẩm</g, r: ">{t('common.product')}<" },
  { v: />Thanh toán</g, r: ">{t('checkout.title')}<" },
  { v: />Địa chỉ giao hàng</g, r: ">{t('checkout.shippingAddress')}<" },
  { v: />Phương thức thanh toán</g, r: ">{t('checkout.paymentMethod')}<" },
  { v: />Đơn hàng của bạn</g, r: ">{t('checkout.orderSummary')}<" },
  { v: />Hoàn tất đặt hàng</g, r: ">{t('checkout.placeOrder')}<" },
  { v: />Thanh toán bằng tiền mặt</g, r: ">{t('checkout.cod')}<" },
  { v: />Chuyển khoản \/ VNPAY</g, r: ">{t('checkout.bankTransfer')}<" },
  { v: />Thẻ tín dụng \/ Ghi nợ</g, r: ">{t('checkout.card')}<" },
  { v: />Ghi chú đơn hàng</g, r: ">{t('checkout.notes')}<" },
  
  // Profile & Orders
  { v: />Tài khoản của tôi</g, r: ">{t('profile.title')}<" },
  { v: />Lịch sử mua hàng</g, r: ">{t('profile.orders')}<" },
  { v: />Sản phẩm yêu thích</g, r: ">{t('profile.wishlist')}<" },
  { v: />Sổ địa chỉ</g, r: ">{t('profile.addresses')}<" },
  { v: />Cài đặt & Pháp lý</g, r: ">{t('profile.settings')}<" },
  { v: />Đăng xuất</g, r: ">{t('profile.logout')}<" },
  { v: />Lịch sử đã xem</g, r: ">{t('profile.viewedHistory')}<" },
  { v: />Đơn hàng của tôi</g, r: ">{t('orders.myOrders')}<" },
  { v: />Tất cả</g, r: ">{t('orders.all')}<" },
  { v: />Đang giao</g, r: ">{t('orders.shipping')}<" },
  { v: />Hoàn thành</g, r: ">{t('orders.completed')}<" },
  { v: />Đã hủy</g, r: ">{t('orders.cancelled')}<" },
  { v: /Đang tải đơn hàng\.\.\./g, r: "{t('orders.loading')}" },
  { v: />Không có đơn hàng nào\.</g, r: ">{t('orders.noOrders')}<" },
];

function processFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processFiles(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const {v, r} of dict) {
        if (v.test(content)) {
          content = content.replace(v, r);
          changed = true;
        }
      }
      
      if (changed) {
        if (!content.includes('useTranslation')) {
          content = "import { useTranslation } from 'react-i18next';\n" + content;
        }
        if (!content.includes("const { t } = useTranslation();")) {
          content = content.replace(/const [a-zA-Z0-9_]+: React\.FC[^=]*= \([^)]*\) => {/, "$&\n  const { t } = useTranslation();");
        }
        fs.writeFileSync(fullPath, content);
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

processFiles(DIR);
