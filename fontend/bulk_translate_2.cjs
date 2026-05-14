const fs = require('fs');
const path = require('path');

const DIR = './src/pages';
const viDictPath = './src/i18n/locales/vi.json';
const enDictPath = './src/i18n/locales/en.json';
const jaDictPath = './src/i18n/locales/ja.json';

const mappings = {
  'OrderTracking.tsx': [
    ['>Đang tải thông tin theo dõi...</', 'orderTracking', 'loading', 'Đang tải thông tin theo dõi...', 'Loading tracking info...', '追跡情報を読み込み中...'],
    ['>Không tìm thấy đơn hàng</', 'orderTracking', 'notFound', 'Không tìm thấy đơn hàng', 'Order not found', '注文が見つかりません'],
    ['>Trang chủ</', 'common', 'home', 'Trang chủ', 'Home', 'ホーム'],
    ['>Theo dõi đơn hàng</', 'orderTracking', 'title', 'Theo dõi đơn hàng', 'Order Tracking', '注文の追跡'],
    ['>Trạng thái đơn hàng</', 'orderTracking', 'status', 'Trạng thái đơn hàng', 'Order Status', '注文ステータス'],
    ['>Đơn hàng đã bị hủy</', 'orderTracking', 'cancelled', 'Đơn hàng đã bị hủy', 'Order cancelled', '注文はキャンセルされました'],
    ['>Đã đặt</', 'orderTracking', 'placed', 'Đã đặt', 'Placed', '注文済み'],
    ['>Xác nhận</', 'orderTracking', 'confirmed', 'Xác nhận', 'Confirmed', '確認済み'],
    ['>Chuẩn bị</', 'orderTracking', 'preparing', 'Chuẩn bị', 'Preparing', '準備中'],
    ['>Đang giao</', 'orderTracking', 'shipping', 'Đang giao', 'Shipping', '配送中'],
    ['>Hoàn thành</', 'orderTracking', 'completed', 'Hoàn thành', 'Completed', '完了'],
    ['>Thông tin tóm tắt</', 'orderTracking', 'summary', 'Thông tin tóm tắt', 'Summary Info', '概要情報'],
    ['>Ngày đặt hàng</', 'orderTracking', 'orderDate', 'Ngày đặt hàng', 'Order Date', '注文日'],
    ['>Tổng thanh toán</', 'orderTracking', 'totalPayment', 'Tổng thanh toán', 'Total Payment', '支払い合計'],
    ['>Không có dữ liệu chi tiết sản phẩm cho đơn hàng này.</', 'orderTracking', 'noDetails', 'Không có dữ liệu chi tiết sản phẩm cho đơn hàng này.', 'No product details for this order.', 'この注文の商品詳細はありません。'],
    ['>Xem chi tiết hóa đơn</', 'orderTracking', 'viewInvoice', 'Xem chi tiết hóa đơn', 'View Invoice', '請求書を見る'],
    ['>Xác nhận hủy đơn</', 'orderTracking', 'confirmCancel', 'Xác nhận hủy đơn', 'Confirm Cancel', 'キャンセルを確認'],
    ['>Lý do hủy đơn</', 'orderTracking', 'cancelReason', 'Lý do hủy đơn', 'Cancel Reason', 'キャンセル理由'],
  ],
  'Payment.tsx': [
    ['>Thanh toán đơn hàng</', 'payment', 'title', 'Thanh toán đơn hàng', 'Checkout Order', '注文の支払い'],
    ['>Bạn chưa có sản phẩm nào cần thanh toán hoặc phiên đã hết hạn.</', 'payment', 'noItems', 'Bạn chưa có sản phẩm nào cần thanh toán hoặc phiên đã hết hạn.', 'You have no items to checkout or session expired.', 'チェックアウトする商品がないか、セッションが期限切れです。'],
    ['>Về giỏ hàng</', 'payment', 'backToCart', 'Về giỏ hàng', 'Back to Cart', 'カートに戻る'],
    ['>Quét mã QR để thanh toán</', 'payment', 'scanQR', 'Quét mã QR để thanh toán', 'Scan QR to pay', 'QRをスキャンして支払う'],
    ['>Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã</', 'payment', 'scanDesc', 'Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã', 'Use banking app or e-wallet to scan code', '銀行アプリまたは電子マネーを使用してコードをスキャンします'],
    ['>Đã hết hạn</', 'payment', 'expired', 'Đã hết hạn', 'Expired', '期限切れ'],
    ['>Thông tin chuyển khoản</', 'payment', 'transferInfo', 'Thông tin chuyển khoản', 'Transfer Information', '振込情報'],
    ['>Ngân hàng</', 'payment', 'bank', 'Ngân hàng', 'Bank', '銀行'],
    ['>Chủ tài khoản</', 'payment', 'accountHolder', 'Chủ tài khoản', 'Account Holder', '口座名義'],
    ['>Số tài khoản</', 'payment', 'accountNumber', 'Số tài khoản', 'Account Number', '口座番号'],
    ['>Nội dung CK</', 'payment', 'transferContent', 'Nội dung CK', 'Transfer Content', '振込内容'],
    ['>Số tiền</', 'payment', 'amount', 'Số tiền', 'Amount', '金額'],
    ['>Đang xác nhận thanh toán...</', 'payment', 'confirming', 'Đang xác nhận thanh toán...', 'Confirming payment...', '支払いを確認中...'],
    ['>Tôi đã thanh toán</', 'payment', 'iPaid', 'Tôi đã thanh toán', 'I have paid', '支払いました'],
    ['>Chọn lại phương thức thanh toán</', 'payment', 'reselectMethod', 'Chọn lại phương thức thanh toán', 'Reselect payment method', '支払い方法を再選択'],
    ['>Giao dịch được bảo mật bởi hệ thống thanh toán của LOTTE Mart. Nội dung chuyển khoản phải chính xác để hệ thống tự động xác nhận.</', 'payment', 'secureDesc', 'Giao dịch được bảo mật bởi hệ thống thanh toán của LOTTE Mart. Nội dung chuyển khoản phải chính xác để hệ thống tự động xác nhận.', 'Transactions are secured by LOTTE Mart payment system. Transfer content must be exact for automatic confirmation.', '取引はロッテマートの支払いシステムによって保護されています。自動確認のためには、転送内容が正確である必要があります。'],
    ['>Bảo mật</', 'payment', 'security', 'Bảo mật', 'Security', 'セキュリティ'],
    ['>Giao đến</', 'payment', 'deliverTo', 'Giao đến', 'Deliver to', '配達先'],
    ['>Chọn nguồn tiền</', 'payment', 'chooseSource', 'Chọn nguồn tiền', 'Choose funding source', '資金源を選択'],
    ['>Thêm nguồn</', 'payment', 'addSource', 'Thêm nguồn', 'Add source', 'ソースを追加'],
    ['>Chuyển khoản ngân hàng (QR)</', 'payment', 'bankTransfer', 'Chuyển khoản ngân hàng (QR)', 'Bank Transfer (QR)', '銀行振込 (QR)'],
    ['>Quét QR bằng app ngân hàng</', 'payment', 'qrApp', 'Quét QR bằng app ngân hàng', 'Scan QR with banking app', '銀行アプリでQRをスキャン'],
    ['>Thanh toán khi nhận hàng</', 'payment', 'cod', 'Thanh toán khi nhận hàng', 'Cash on Delivery', '代金引換'],
    ['>Tiền mặt hoặc Quẹt thẻ tại nhà</', 'payment', 'cashOrCard', 'Tiền mặt hoặc Quẹt thẻ tại nhà', 'Cash or Card at home', '自宅で現金またはカード'],
    ['>Thanh toán An Toàn TUYỆT ĐỐI</', 'payment', 'absoluteSecurity', 'Thanh toán An Toàn TUYỆT ĐỐI', 'ABSOLUTE SECURE Payment', '絶対安全な支払い'],
    ['>Thông tin thẻ của bạn được trực tiếp xử lý bởi Cổng thanh toán quốc tế và KHÔNG lưu trữ trên hệ thống của LOTTE Mart.</', 'payment', 'cardDesc', 'Thông tin thẻ của bạn được trực tiếp xử lý bởi Cổng thanh toán quốc tế và KHÔNG lưu trữ trên hệ thống của LOTTE Mart.', 'Your card info is processed directly by International Payment Gateway and NOT stored on LOTTE Mart system.', 'カード情報は国際決済ゲートウェイによって直接処理され、ロッテマートのシステムには保存されません。'],
  ],
  'PaymentMethods.tsx': [
    ['>Tài khoản</', 'common', 'account', 'Tài khoản', 'Account', 'アカウント'],
    ['>Phương thức thanh toán</', 'paymentMethods', 'title', 'Phương thức thanh toán', 'Payment Methods', '支払い方法'],
    ['>Phương thức thanh toán đã lưu</', 'paymentMethods', 'savedMethods', 'Phương thức thanh toán đã lưu', 'Saved Payment Methods', '保存された支払い方法'],
    ['>Quản lý thẻ và ví điện tử để thanh toán nhanh hơn</', 'paymentMethods', 'manageCards', 'Quản lý thẻ và ví điện tử để thanh toán nhanh hơn', 'Manage cards and e-wallets for faster checkout', '迅速なチェックアウトのためにカードと電子マネーを管理します'],
    ['>Thêm phương thức mới</', 'paymentMethods', 'addNew', 'Thêm phương thức mới', 'Add new method', '新しい方法を追加'],
    ['>Chưa lưu phương thức thanh toán nào</', 'paymentMethods', 'noSaved', 'Chưa lưu phương thức thanh toán nào', 'No payment methods saved', '支払い方法が保存されていません'],
    ['>Thêm một thẻ hoặc ví để thanh toán dễ dàng</', 'paymentMethods', 'addForEasy', 'Thêm một thẻ hoặc ví để thanh toán dễ dàng', 'Add a card or wallet for easy payment', '簡単な支払いのためにカードまたはウォレットを追加します'],
    ['>Hết hạn / Mở rộng</', 'paymentMethods', 'expireExtend', 'Hết hạn / Mở rộng', 'Expire / Extend', '期限切れ / 延長'],
    ['>Đặt mặc định</', 'paymentMethods', 'setDefault', 'Đặt mặc định', 'Set Default', 'デフォルトに設定'],
    ['>Luôn có sẵn khi thanh toán</', 'paymentMethods', 'alwaysAvail', 'Luôn có sẵn khi thanh toán', 'Always available at checkout', 'チェックアウト時に常に利用可能'],
    ['>Lịch sử giao dịch qua cổng</', 'paymentMethods', 'txHistory', 'Lịch sử giao dịch qua cổng', 'Gateway transaction history', 'ゲートウェイ取引履歴'],
    ['>Chưa có giao dịch ghi nhận.</', 'paymentMethods', 'noTx', 'Chưa có giao dịch ghi nhận.', 'No transactions recorded.', '記録された取引はありません。'],
    ['>Mã GD</', 'paymentMethods', 'txId', 'Mã GD', 'Tx ID', '取引ID'],
    ['>Thời gian</', 'common', 'time', 'Thời gian', 'Time', '時間'],
    ['>THÀNH CÔNG</', 'paymentMethods', 'success', 'THÀNH CÔNG', 'SUCCESS', '成功'],
    ['>THẤT BẠI</', 'paymentMethods', 'failed', 'THẤT BẠI', 'FAILED', '失敗'],
    ['>ĐANG XỬ LÍ</', 'paymentMethods', 'processing', 'ĐANG XỬ LÍ', 'PROCESSING', '処理中'],
    ['>Thêm phương thức</', 'paymentMethods', 'addMethod', 'Thêm phương thức', 'Add Method', '方法を追加'],
    ['>Thẻ Ngân Hàng</', 'paymentMethods', 'bankCard', 'Thẻ Ngân Hàng', 'Bank Card', '銀行カード'],
    ['>Ví Điện Tử</', 'paymentMethods', 'eWallet', 'Ví Điện Tử', 'E-Wallet', '電子マネー'],
    ['>Số thẻ</', 'paymentMethods', 'cardNumber', 'Số thẻ', 'Card Number', 'カード番号'],
    ['>Tên in trên thẻ</', 'paymentMethods', 'cardName', 'Tên in trên thẻ', 'Name on Card', 'カード名義'],
    ['>Ngày hết hạn</', 'paymentMethods', 'expDate', 'Ngày hết hạn', 'Expiry Date', '有効期限'],
    ['>Số điện thoại liên kết ví</', 'paymentMethods', 'walletPhone', 'Số điện thoại liên kết ví', 'Wallet linked phone', 'ウォレットにリンクされた電話番号'],
    ['>Đặt làm phương thức mặc định</', 'paymentMethods', 'setAsDefault', 'Đặt làm phương thức mặc định', 'Set as default method', 'デフォルトの方法として設定'],
    ['>Lưu Phương Thức</', 'paymentMethods', 'saveMethod', 'Lưu Phương Thức', 'Save Method', '方法を保存'],
  ],
  'PaymentSuccess.tsx': [
    ['>Đang tải thông tin đơn hàng...</', 'paymentSuccess', 'loading', 'Đang tải thông tin đơn hàng...', 'Loading order info...', '注文情報を読み込み中...'],
    ['>Bấm vào đây để về trang chủ nếu quá lâu</', 'paymentSuccess', 'goHomeTimeout', 'Bấm vào đây để về trang chủ nếu quá lâu', 'Click here to return to home if it takes too long', '時間がかかる場合はここをクリックしてホームに戻ります'],
    ['>Thanh toán thành công</', 'paymentSuccess', 'title', 'Thanh toán thành công', 'Payment Successful', '支払いが成功しました'],
    ['>Cảm ơn bạn đã mua sắm!</', 'paymentSuccess', 'thanks', 'Cảm ơn bạn đã mua sắm!', 'Thank you for shopping!', 'お買い物ありがとうございます！'],
    ['>Xem đơn hàng</', 'paymentSuccess', 'viewOrder', 'Xem đơn hàng', 'View Order', '注文を見る'],
    ['>Tiếp tục mua sắm</', 'paymentSuccess', 'continueShopping', 'Tiếp tục mua sắm', 'Continue Shopping', '買い物を続ける'],
    ['>Cảm ơn bạn đã mua sắm! Đơn hàng của bạn đang được xử lý.</', 'paymentSuccess', 'processing', 'Cảm ơn bạn đã mua sắm! Đơn hàng của bạn đang được xử lý.', 'Thank you for shopping! Your order is being processed.', 'お買い物ありがとうございます！注文は処理中です。'],
    ['>Chi tiết đơn hàng</', 'paymentSuccess', 'details', 'Chi tiết đơn hàng', 'Order Details', '注文の詳細'],
    ['>Mã đơn hàng</', 'paymentSuccess', 'orderId', 'Mã đơn hàng', 'Order ID', '注文ID'],
    ['>Tạm tính</', 'paymentSuccess', 'subtotal', 'Tạm tính', 'Subtotal', '小計'],
    ['>L.Point tích lũy</', 'paymentSuccess', 'lpoint', 'L.Point tích lũy', 'L.Point Earned', '獲得L.Point'],
  ],
  'PaymentFailed.tsx': [
    ['>Thanh toán thất bại</', 'paymentFailed', 'title', 'Thanh toán thất bại', 'Payment Failed', '支払いに失敗しました'],
    ['>Thử lại ngay</', 'paymentFailed', 'retry', 'Thử lại ngay', 'Retry Now', '今すぐ再試行'],
    ['>Quay về giỏ hàng</', 'paymentFailed', 'backToCart', 'Quay về giỏ hàng', 'Back to Cart', 'カートに戻る'],
    ['>Cần hỗ trợ gấp?</', 'paymentFailed', 'needHelp', 'Cần hỗ trợ gấp?', 'Need urgent help?', '緊急のサポートが必要ですか？'],
    ['>Liên hệ với đội ngũ CSKH 24/7</', 'paymentFailed', 'contactCs', 'Liên hệ với đội ngũ CSKH 24/7', 'Contact 24/7 Customer Support', '24時間年中無休のカスタマーサポートにお問い合わせください'],
    ['>Gọi 1800 1234</', 'paymentFailed', 'callUs', 'Gọi 1800 1234', 'Call 1800 1234', '1800 1234 に電話する'],
    ['>Chi tiết lỗi</', 'paymentFailed', 'errorDetails', 'Chi tiết lỗi', 'Error Details', 'エラーの詳細'],
    ['>Mã đơn hàng:</', 'paymentFailed', 'orderId', 'Mã đơn hàng:', 'Order ID:', '注文ID:'],
    ['>Thời gian:</', 'paymentFailed', 'time', 'Thời gian:', 'Time:', '時間:'],
  ],
  'ReviewManager.tsx': [
    ['>Đang tải đánh giá...</', 'reviews', 'loading', 'Đang tải đánh giá...', 'Loading reviews...', 'レビューを読み込み中...'],
    ['>Bạn đã giúp cộng đồng đưa ra quyết định mua sắm tốt hơn.</', 'reviews', 'helpedCommunity', 'Bạn đã giúp cộng đồng đưa ra quyết định mua sắm tốt hơn.', 'You have helped the community make better shopping decisions.', 'コミュニティがより良い買い物の決定を下すのを助けました。'],
    ['>Tổng đánh giá</', 'reviews', 'totalReviews', 'Tổng đánh giá', 'Total Reviews', '総レビュー数'],
    ['>Lượt thích</', 'reviews', 'likes', 'Lượt thích', 'Likes', 'いいね'],
    ['>Điểm trung bình</', 'reviews', 'avgScore', 'Điểm trung bình', 'Average Score', '平均スコア'],
    ['>Top đóng góp nổi bật</', 'reviews', 'topContributor', 'Top đóng góp nổi bật', 'Top Contributor', 'トップ貢献者'],
    ['>Đánh giá đang chờ</', 'reviews', 'pending', 'Đánh giá đang chờ', 'Pending Reviews', '保留中のレビュー'],
    ['>Không có đánh giá nào đang chờ.</', 'reviews', 'noPending', 'Không có đánh giá nào đang chờ.', 'No pending reviews.', '保留中のレビューはありません。'],
    ['>Bạn chưa viết đánh giá nào.</', 'reviews', 'noReviews', 'Bạn chưa viết đánh giá nào.', 'You have not written any reviews.', 'まだレビューを書いていません。'],
    ['>Đã xác thực</', 'reviews', 'verified', 'Đã xác thực', 'Verified', '確認済み'],
    ['>Điểm của bạn</', 'reviews', 'yourScore', 'Điểm của bạn', 'Your Score', 'あなたのスコア'],
    ['>Phản hồi</', 'reviews', 'feedback', 'Phản hồi', 'Feedback', 'フィードバック'],
    ['>Chỉnh sửa đánh giá</', 'reviews', 'editReview', 'Chỉnh sửa đánh giá', 'Edit Review', 'レビューを編集'],
    ['>Điểm đánh giá</', 'reviews', 'reviewScore', 'Điểm đánh giá', 'Review Score', 'レビュースコア'],
    ['>Nội dung đánh giá</', 'reviews', 'reviewContent', 'Nội dung đánh giá', 'Review Content', 'レビュー内容'],
  ],
  'Reviews.tsx': [
    ['>Đánh giá của tôi</', 'reviews', 'myReviews', 'Đánh giá của tôi', 'My Reviews', '私のレビュー'],
    ['>Bạn chưa có đánh giá nào.</', 'reviews', 'noReviewsAlt', 'Bạn chưa có đánh giá nào.', 'You don\'t have any reviews yet.', 'まだレビューがありません。'],
  ]
};

function updateDict(lang, dictPath) {
  const data = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
  for (const [file, items] of Object.entries(mappings)) {
    for (const [search, ns, key, viStr, enStr, jaStr] of items) {
      if (!data[ns]) data[ns] = {};
      const val = lang === 'vi' ? viStr : lang === 'en' ? enStr : jaStr;
      data[ns][key] = val;
    }
  }
  fs.writeFileSync(dictPath, JSON.stringify(data, null, 2));
}

updateDict('vi', viDictPath);
updateDict('en', enDictPath);
updateDict('ja', jaDictPath);
console.log('Dictionaries updated successfully');

for (const [file, items] of Object.entries(mappings)) {
  const filePath = path.join(DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log('Not found:', file);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  let changed = false;
  items.forEach(([search, ns, key]) => {
    const replaceWith = `>{t('${ns}.${key}')}</`;
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (content.match(regex)) {
      content = content.replace(regex, replaceWith);
      changed = true;
    }
  });

  const textMatches = [
    { regex: />\s*Liên hệ hỗ trợ\s*</g, rep: `>{t('orderDetail.contactSupport')}<` },
    { regex: />\s*Hủy đơn hàng\s*</g, rep: `>{t('orderDetail.cancelOrder')}<` },
    { regex: />\s*Không thể hủy\s*</g, rep: `>{t('orderDetail.cannotCancel')}<` },
    { regex: />\s*Xem chi tiết hóa đơn\s*</g, rep: `>{t('orderTracking.viewInvoice')}<` },
    { regex: />\s*Đang xử lý\.\.\.\s*</g, rep: `>{t('common.processing')}<` },
    { regex: />\s*Tôi đã thanh toán\s*</g, rep: `>{t('payment.iPaid')}<` },
    { regex: />\s*Chọn lại phương thức thanh toán\s*</g, rep: `>{t('payment.reselectMethod')}<` },
    { regex: />\s*Tài khoản\s*</g, rep: `>{t('common.account')}<` },
    { regex: />\s*Mặc định\s*</g, rep: `>{t('address.default')}<` },
    { regex: />\s*Đặt mặc định\s*</g, rep: `>{t('paymentMethods.setDefault')}<` },
    { regex: />\s*Xem đơn hàng\s*</g, rep: `>{t('paymentSuccess.viewOrder')}<` },
    { regex: />\s*Tiếp tục mua sắm\s*</g, rep: `>{t('paymentSuccess.continueShopping')}<` },
    { regex: />\s*Thử lại ngay\s*</g, rep: `>{t('paymentFailed.retry')}<` },
    { regex: />\s*Quay về giỏ hàng\s*</g, rep: `>{t('paymentFailed.backToCart')}<` },
    { regex: />\s*Đã xác thực\s*</g, rep: `>{t('reviews.verified')}<` },
    { regex: />\s*Hủy\s*</g, rep: `>{t('common.cancel')}<` },
  ];

  textMatches.forEach(({ regex, rep }) => {
    if (content.match(regex)) {
      content = content.replace(regex, rep);
      changed = true;
    }
  });

  if (changed) {
    if (!content.includes('useTranslation')) {
      content = content.replace(/(import React[^;]*;)/, '\$1\nimport { useTranslation } from \'react-i18next\';');
    }
    if (!content.includes('const { t } = useTranslation();')) {
      const fcRegex = /const [a-zA-Z0-9_]+(: React\.FC[^=]*)* = \([^)]*\) => {/;
      content = content.replace(fcRegex, match => match + '\n  const { t } = useTranslation();');
    }
    fs.writeFileSync(filePath, content);
    console.log('Updated', file);
  } else {
    console.log('No matches found for', file);
  }
}
