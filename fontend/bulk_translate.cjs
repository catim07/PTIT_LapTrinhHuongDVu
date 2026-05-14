const fs = require('fs');
const path = require('path');

const DIR = './src/pages';
const viDictPath = './src/i18n/locales/vi.json';
const enDictPath = './src/i18n/locales/en.json';
const jaDictPath = './src/i18n/locales/ja.json';

// { [file]: [ [searchStr, namespace, key, vi, en, ja], ... ] }
const mappings = {
  'Settings.tsx': [
    ['>Đang tải cài đặt...</', 'settings', 'loadingSettings', 'Đang tải cài đặt...', 'Loading settings...', '設定を読み込み中...'],
    ['>Cài đặt</', 'settings', 'title', 'Cài đặt', 'Settings', '設定'],
    ['>Quản lý mật khẩu, bảo mật và tùy chọn thông báo của bạn</', 'settings', 'desc', 'Quản lý mật khẩu, bảo mật và tùy chọn thông báo của bạn', 'Manage your password, security, and notification preferences', 'パスワード、セキュリティ、および通知設定を管理します'],
    ['>Mật khẩu &amp; Bảo mật</', 'settings', 'pwdSecurity', 'Mật khẩu & Bảo mật', 'Password & Security', 'パスワードとセキュリティ'],
    ['>Mật khẩu hiện tại</', 'settings', 'currentPwd', 'Mật khẩu hiện tại', 'Current Password', '現在のパスワード'],
    ['>Mật khẩu mới</', 'settings', 'newPwd', 'Mật khẩu mới', 'New Password', '新しいパスワード'],
    ['>Xác nhận mật khẩu mới</', 'settings', 'confirmNewPwd', 'Xác nhận mật khẩu mới', 'Confirm New Password', '新しいパスワードを確認'],
    ['>Xác thực 2 yếu tố</', 'settings', 'twoFactorAuth', 'Xác thực 2 yếu tố', 'Two-Factor Authentication', '2要素認証'],
    ['>Thêm một lớp bảo mật cho tài khoản của bạn</', 'settings', 'twoFactorDesc', 'Thêm một lớp bảo mật cho tài khoản của bạn', 'Add an extra layer of security to your account', 'アカウントにセキュリティ層を追加します'],
    ['>Bảo mật đăng nhập</', 'settings', 'loginSecurity', 'Bảo mật đăng nhập', 'Login Security', 'ログインセキュリティ'],
    ['>Đăng xuất khỏi tất cả thiết bị</', 'settings', 'logoutAll', 'Đăng xuất khỏi tất cả thiết bị', 'Log out of all devices', 'すべてのデバイスからログアウト'],
    ['>Tùy chọn thông báo</', 'settings', 'notiOptions', 'Tùy chọn thông báo', 'Notification Options', '通知オプション'],
    ['>Tùy chọn tài khoản</', 'settings', 'accountOptions', 'Tùy chọn tài khoản', 'Account Options', 'アカウントオプション'],
    ['>Ngôn ngữ</', 'settings', 'language', 'Ngôn ngữ', 'Language', '言語'],
    ['>Chọn ngôn ngữ hiển thị</', 'settings', 'chooseLanguage', 'Chọn ngôn ngữ hiển thị', 'Choose display language', '表示言語を選択'],
    ['>Tiếng Việt</', 'settings', 'vietnamese', 'Tiếng Việt', 'Vietnamese', 'ベトナム語'],
    ['>Hiển thị hồ sơ</', 'settings', 'profileVisibility', 'Hiển thị hồ sơ', 'Profile Visibility', 'プロフィールの表示'],
    ['>Cho phép người khác xem hồ sơ của bạn</', 'settings', 'allowViewProfile', 'Cho phép người khác xem hồ sơ của bạn', 'Allow others to view your profile', '他の人がプロフィールを閲覧できるようにする'],
    ['>Nhận thông tin marketing</', 'settings', 'marketingOptIn', 'Nhận thông tin marketing', 'Marketing Opt-In', 'マーケティング情報の受け取り'],
    ['>Nhận thông tin ưu đãi và chương trình mới</', 'settings', 'marketingDesc', 'Nhận thông tin ưu đãi và chương trình mới', 'Receive updates on offers and new programs', 'オファーや新しいプログラムに関する情報を受け取る'],
    ['>Hiển thị số điện thoại</', 'settings', 'phoneVisibility', 'Hiển thị số điện thoại', 'Phone Visibility', '電話番号の表示'],
    ['>Đang lưu...</', 'common', 'saving', 'Đang lưu...', 'Saving...', '保存中...'],
    ['>Đổi mật khẩu</', 'settings', 'changePwd', 'Đổi mật khẩu', 'Change Password', 'パスワードを変更'],
  ],
  'Addresses.tsx': [
    ['>Sổ địa chỉ</', 'profile', 'addressesTitle', 'Sổ địa chỉ', 'Address Book', 'アドレス帳'],
    ['>Thêm địa chỉ mới</', 'address', 'addNew', 'Thêm địa chỉ mới', 'Add New Address', '新しい住所を追加'],
    ['>Chưa có địa chỉ nào</', 'address', 'noAddress', 'Chưa có địa chỉ nào', 'No addresses yet', '住所がありません'],
    ['>Vui lòng thêm địa chỉ để thuận tiện hơn trong việc mua sắm.</', 'address', 'addAddressPrompt', 'Vui lòng thêm địa chỉ để thuận tiện hơn trong việc mua sắm.', 'Please add an address for more convenient shopping.', 'より便利なショッピングのために住所を追加してください。'],
    ['>Mặc định</', 'address', 'default', 'Mặc định', 'Default', 'デフォルト'],
    ['>Sửa</', 'common', 'edit', 'Sửa', 'Edit', '編集'],
    ['>Xóa</', 'common', 'delete', 'Xóa', 'Delete', '削除'],
    ['>Thiết lập mặc định</', 'address', 'setDefault', 'Thiết lập mặc định', 'Set as Default', 'デフォルトに設定'],
    ['>Tên người nhận</', 'address', 'recipientName', 'Tên người nhận', 'Recipient Name', '受取人名'],
    ['>Số điện thoại</', 'address', 'phone', 'Số điện thoại', 'Phone Number', '電話番号'],
    ['>Tỉnh/TP</', 'address', 'province', 'Tỉnh/TP', 'Province/City', '都道府県/都市'],
    ['>Quận/Huyện</', 'address', 'district', 'Quận/Huyện', 'District', '市区町村'],
    ['>Phường/Xã</', 'address', 'ward', 'Phường/Xã', 'Ward', '区/村'],
    ['>Địa chỉ cụ thể (Số nhà, đường)</', 'address', 'specific', 'Địa chỉ cụ thể (Số nhà, đường)', 'Specific Address (House No, Street)', '具体的な住所（番地、通り）'],
    ['>Đặt làm địa chỉ mặc định</', 'address', 'setAsDefault', 'Đặt làm địa chỉ mặc định', 'Set as Default Address', 'デフォルトの住所として設定'],
    ['>Hủy</', 'common', 'cancel', 'Hủy', 'Cancel', 'キャンセル'],
    ['>Lưu địa chỉ</', 'address', 'saveAddress', 'Lưu địa chỉ', 'Save Address', '住所を保存'],
    ['>Xác nhận xóa địa chỉ</', 'address', 'confirmDeleteTitle', 'Xác nhận xóa địa chỉ', 'Confirm Delete Address', '住所の削除を確認'],
    ['>Bạn có chắc chắn muốn xóa địa chỉ này? Hành động không thể hoàn tác.</', 'address', 'confirmDeleteDesc', 'Bạn có chắc chắn muốn xóa địa chỉ này? Hành động không thể hoàn tác.', 'Are you sure you want to delete this address? This action cannot be undone.', 'この住所を削除してもよろしいですか？この操作は元に戻せません。'],
    ['>Đóng</', 'common', 'close', 'Đóng', 'Close', '閉じる'],
  ],
  'OrderDetail.tsx': [
    ['>Đang tải chi tiết đơn hàng...</', 'orderDetail', 'loading', 'Đang tải chi tiết đơn hàng...', 'Loading order details...', '注文の詳細を読み込み中...'],
    ['>Không tìm thấy đơn hàng</', 'orderDetail', 'notFound', 'Không tìm thấy đơn hàng', 'Order not found', '注文が見つかりません'],
    ['>Trở lại danh sách</', 'orderDetail', 'backToList', 'Trở lại danh sách', 'Back to List', 'リストに戻る'],
    ['>Liên hệ hỗ trợ</', 'orderDetail', 'contactSupport', 'Liên hệ hỗ trợ', 'Contact Support', 'サポートに連絡'],
    ['>Hủy đơn</', 'orderDetail', 'cancelOrder', 'Hủy đơn', 'Cancel Order', '注文をキャンセル'],
    ['>Không thể hủy</', 'orderDetail', 'cannotCancel', 'Không thể hủy', 'Cannot Cancel', 'キャンセルできません'],
    ['>Mua lại</', 'orderDetail', 'buyAgain', 'Mua lại', 'Buy Again', '再度購入'],
    ['>Tiến trình giao hàng</', 'orderDetail', 'deliveryProgress', 'Tiến trình giao hàng', 'Delivery Progress', '配送状況'],
    ['>Xem chi tiết hành trình &rarr;</', 'orderDetail', 'viewJourney', 'Xem chi tiết hành trình &rarr;', 'View Journey Details &rarr;', '配送の旅の詳細を見る &rarr;'],
    ['>Địa chỉ nhận hàng</', 'orderDetail', 'shippingAddress', 'Địa chỉ nhận hàng', 'Shipping Address', '配送先住所'],
    ['>Chưa có thông tin địa chỉ</', 'orderDetail', 'noAddressInfo', 'Chưa có thông tin địa chỉ', 'No address information', '住所情報がありません'],
    ['>Thanh toán</', 'orderDetail', 'payment', 'Thanh toán', 'Payment', '支払い'],
    ['>Phương thức:</', 'orderDetail', 'method', 'Phương thức:', 'Method:', '方法:'],
    ['>Mã giao dịch:</', 'orderDetail', 'transactionId', 'Mã giao dịch:', 'Transaction ID:', '取引ID:'],
    ['>Trạng thái:</', 'orderDetail', 'status', 'Trạng thái:', 'Status:', 'ステータス:'],
    ['>Tóm tắt đơn hàng</', 'orderDetail', 'orderSummary', 'Tóm tắt đơn hàng', 'Order Summary', '注文の概要'],
    ['>Tổng tiền hàng:</', 'orderDetail', 'subTotal', 'Tổng tiền hàng:', 'Subtotal:', '小計:'],
    ['>Phí vận chuyển:</', 'orderDetail', 'shippingFee', 'Phí vận chuyển:', 'Shipping Fee:', '送料:'],
    ['>Giảm giá:</', 'orderDetail', 'discount', 'Giảm giá:', 'Discount:', '割引:'],
    ['>Điểm tích lũy:</', 'orderDetail', 'earnedPoints', 'Điểm tích lũy:', 'Earned Points:', '獲得ポイント:'],
    ['>Tổng cộng:</', 'orderDetail', 'total', 'Tổng cộng:', 'Total:', '合計:'],
    ['>Xác nhận hủy đơn</', 'orderDetail', 'confirmCancelTitle', 'Xác nhận hủy đơn', 'Confirm Cancel Order', '注文のキャンセルを確認'],
    ['>Lý do hủy đơn</', 'orderDetail', 'cancelReason', 'Lý do hủy đơn', 'Cancel Reason', 'キャンセル理由'],
  ],
  'ReturnRequests.tsx': [
    ['>Đang tải yêu cầu đổi trả...</', 'returns', 'loading', 'Đang tải yêu cầu đổi trả...', 'Loading return requests...', '返品リクエストを読み込み中...'],
    ['>Đổi trả / Hoàn tiền</', 'returns', 'title', 'Đổi trả / Hoàn tiền', 'Returns / Refunds', '返品 / 返金'],
    ['>Tạo và theo dõi yêu cầu đổi trả cho các đơn đã giao.</', 'returns', 'desc', 'Tạo và theo dõi yêu cầu đổi trả cho các đơn đã giao.', 'Create and track return requests for delivered orders.', '配達済み注文の返品リクエストを作成して追跡します。'],
    ['>Tạo yêu cầu mới</', 'returns', 'createNew', 'Tạo yêu cầu mới', 'Create New Request', '新しいリクエストを作成'],
    ['>Chọn đơn hàng đã giao</', 'returns', 'selectDelivered', 'Chọn đơn hàng đã giao', 'Select Delivered Order', '配達済みの注文を選択'],
    ['>Lý do</', 'returns', 'reason', 'Lý do', 'Reason', '理由'],
    ['>Hàng bị lỗi/không đúng mô tả</', 'returns', 'reasonDefective', 'Hàng bị lỗi/không đúng mô tả', 'Defective/Not as described', '欠陥がある/説明と異なる'],
    ['>Thiếu sản phẩm trong đơn</', 'returns', 'reasonMissing', 'Thiếu sản phẩm trong đơn', 'Missing items', '商品が不足している'],
    ['>Giao nhầm sản phẩm</', 'returns', 'reasonWrong', 'Giao nhầm sản phẩm', 'Wrong item delivered', '間違った商品が配達された'],
    ['>Tôi đổi ý không muốn nhận hàng</', 'returns', 'reasonChangedMind', 'Tôi đổi ý không muốn nhận hàng', 'Changed mind', '気が変わった'],
    ['>Lý do khác</', 'returns', 'reasonOther', 'Lý do khác', 'Other reason', 'その他の理由'],
    ['>Mô tả chi tiết</', 'returns', 'details', 'Mô tả chi tiết', 'Detailed Description', '詳細な説明'],
    ['>Chưa có yêu cầu đổi trả nào.</', 'returns', 'noRequests', 'Chưa có yêu cầu đổi trả nào.', 'No return requests yet.', '返品リクエストはまだありません。'],
    ['>Hủy yêu cầu</', 'returns', 'cancelRequest', 'Hủy yêu cầu', 'Cancel Request', 'リクエストをキャンセル'],
  ],
  'SupportCenter.tsx': [
    ['>Phiếu hỗ trợ của tôi</', 'support', 'myTickets', 'Phiếu hỗ trợ của tôi', 'My Support Tickets', 'マイサポートチケット'],
    ['>Tạo mới</', 'support', 'createNew', 'Tạo mới', 'Create New', '新規作成'],
    ['>Tất cả</', 'support', 'all', 'Tất cả', 'All', 'すべて'],
    ['>Đang xử lý</', 'support', 'processing', 'Đang xử lý', 'Processing', '処理中'],
    ['>Đã đóng</', 'support', 'closed', 'Đã đóng', 'Closed', 'クローズ'],
    ['>Chưa có phiếu hỗ trợ nào.</', 'support', 'noTickets', 'Chưa có phiếu hỗ trợ nào.', 'No support tickets yet.', 'サポートチケットはまだありません。'],
    ['>Tạo phiếu hỗ trợ mới</', 'support', 'createTicketTitle', 'Tạo phiếu hỗ trợ mới', 'Create New Support Ticket', '新しいサポートチケットを作成'],
    ['>Chủ đề / Vấn đề cần hỗ trợ</', 'support', 'topic', 'Chủ đề / Vấn đề cần hỗ trợ', 'Topic / Issue to support', 'トピック / サポートが必要な問題'],
    ['>Gửi yêu cầu</', 'support', 'sendRequest', 'Gửi yêu cầu', 'Send Request', 'リクエストを送信'],
    ['>Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện.</', 'support', 'noMessages', 'Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện.', 'No messages yet. Start chatting.', 'まだメッセージはありません。チャットを開始してください。'],
    ['>Hỗ trợ khách hàng</', 'support', 'customerSupport', 'Hỗ trợ khách hàng', 'Customer Support', 'カスタマーサポート'],
    ['>Trung tâm hỗ trợ khách hàng</', 'support', 'supportCenter', 'Trung tâm hỗ trợ khách hàng', 'Customer Support Center', 'カスタマーサポートセンター'],
    ['>Chọn một phiếu hỗ trợ từ danh sách bên trái hoặc tạo mới để được trợ giúp ngay.</', 'support', 'selectPrompt', 'Chọn một phiếu hỗ trợ từ danh sách bên trái hoặc tạo mới để được trợ giúp ngay.', 'Select a support ticket from the list on the left or create a new one to get help immediately.', '左側のリストからサポートチケットを選択するか、新しく作成してすぐにヘルプを受けてください。'],
  ],
  'SharedFamilyCart.tsx': [
    ['>Giỏ Hàng Gia Đình</', 'familyCart', 'title', 'Giỏ Hàng Gia Đình', 'Family Cart', 'ファミリーカート'],
    ['>Cùng gia đình thêm sản phẩm vào chung một giỏ hàng — đồng bộ realtime</', 'familyCart', 'desc', 'Cùng gia đình thêm sản phẩm vào chung một giỏ hàng — đồng bộ realtime', 'Add products to a shared cart with your family — synced in realtime', '家族と一緒に共有カートに商品を追加 — リアルタイムで同期'],
    ['>Tạo phòng mới</', 'familyCart', 'createNew', 'Tạo phòng mới', 'Create New Room', '新しいルームを作成'],
    ['>Tạo mã phòng và chia sẻ cho thành viên</', 'familyCart', 'createDesc', 'Tạo mã phòng và chia sẻ cho thành viên', 'Create a room code and share it with members', 'ルームコードを作成してメンバーと共有します'],
    ['>Tạo giỏ hàng</', 'familyCart', 'createCart', 'Tạo giỏ hàng', 'Create Cart', 'カートを作成'],
    ['>Tham gia phòng</', 'familyCart', 'joinRoom', 'Tham gia phòng', 'Join Room', 'ルームに参加'],
    ['>Nhập mã phòng được chia sẻ</', 'familyCart', 'joinDesc', 'Nhập mã phòng được chia sẻ', 'Enter the shared room code', '共有されたルームコードを入力します'],
    ['>Rời phòng</', 'familyCart', 'leaveRoom', 'Rời phòng', 'Leave Room', 'ルームを退出'],
    ['>Giỏ hàng trống — thêm sản phẩm bên dưới</', 'familyCart', 'emptyCart', 'Giỏ hàng trống — thêm sản phẩm bên dưới', 'Empty cart — add products below', '空のカート — 下に商品を追加します'],
    ['>Thành viên</', 'familyCart', 'members', 'Thành viên', 'Members', 'メンバー'],
    ['>Bạn</', 'familyCart', 'you', 'Bạn', 'You', 'あなた'],
    ['>Chia sẻ mã phòng</', 'familyCart', 'shareCode', 'Chia sẻ mã phòng', 'Share Room Code', 'ルームコードを共有'],
  ],
  'LoyaltyRewards.tsx': [
    ['>Đang tải dữ liệu điểm...</', 'loyalty', 'loading', 'Đang tải dữ liệu điểm...', 'Loading points data...', 'ポイントデータを読み込み中...'],
    ['>Điểm thưởng &amp; Ưu đãi thành viên</', 'loyalty', 'title', 'Điểm thưởng & Ưu đãi thành viên', 'Rewards & Member Offers', 'リワードとメンバーシップ特典'],
    ['>Điểm</', 'loyalty', 'points', 'Điểm', 'Points', 'ポイント'],
    ['>Tiến độ lên mức tiếp theo</', 'loyalty', 'progressToNext', 'Tiến độ lên mức tiếp theo', 'Progress to next level', '次のレベルへの進捗状況'],
    ['>Hiện ID thành viên</', 'loyalty', 'showMemberId', 'Hiện ID thành viên', 'Show Member ID', 'メンバーIDを表示'],
    ['>Lịch sử đầy đủ</', 'loyalty', 'fullHistory', 'Lịch sử đầy đủ', 'Full History', 'すべての履歴'],
    ['>Giao dịch gần đây</', 'loyalty', 'recentTransactions', 'Giao dịch gần đây', 'Recent Transactions', '最近の取引'],
    ['>Xem tất cả</', 'loyalty', 'viewAll', 'Xem tất cả', 'View All', 'すべて見る'],
    ['>Ngày</', 'common', 'date', 'Ngày', 'Date', '日付'],
    ['>Nguồn</', 'loyalty', 'source', 'Nguồn', 'Source', 'ソース'],
    ['>Loại</', 'common', 'type', 'Loại', 'Type', 'タイプ'],
    ['>Chưa có lịch sử giao dịch điểm thưởng.</', 'loyalty', 'noHistory', 'Chưa có lịch sử giao dịch điểm thưởng.', 'No reward points transaction history yet.', 'リワードポイントの取引履歴はまだありません。'],
    ['>Đổi điểm thưởng</', 'loyalty', 'redeemPoints', 'Đổi điểm thưởng', 'Redeem Points', 'ポイントを交換する'],
    ['>Chọn từ hàng trăm phần thưởng độc quyền được thiết kế dành riêng cho bạn.</', 'loyalty', 'redeemDesc', 'Chọn từ hàng trăm phần thưởng độc quyền được thiết kế dành riêng cho bạn.', 'Choose from hundreds of exclusive rewards designed just for you.', 'あなたのためだけにデザインされた何百もの限定特典からお選びください。'],
    ['>Tất cả phần thưởng</', 'loyalty', 'allRewards', 'Tất cả phần thưởng', 'All Rewards', 'すべてのリワード'],
    ['>Đổi ngay</', 'loyalty', 'redeemNow', 'Đổi ngay', 'Redeem Now', '今すぐ交換'],
    ['>Không đủ điểm</', 'loyalty', 'notEnoughPoints', 'Không đủ điểm', 'Not Enough Points', 'ポイントが足りません'],
  ],
  'Coupons.tsx': [
    ['>Ví Voucher</', 'coupons', 'walletTitle', 'Ví Voucher', 'Voucher Wallet', 'バウチャーウォレット'],
    ['>Mã đã hết lượt sử dụng</', 'coupons', 'fullyUsed', 'Mã đã hết lượt sử dụng', 'Fully used coupon', '完全に利用されたクーポン'],
    ['>Mã đã hết hạn</', 'coupons', 'expired', 'Mã đã hết hạn', 'Expired coupon', '期限切れクーポン'],
    ['>Không tìm thấy mã giảm giá</', 'coupons', 'notFound', 'Không tìm thấy mã giảm giá', 'Coupon not found', 'クーポンが見つかりません'],
    ['>Hãy kiểm tra lại bộ lọc hoặc thử mã khác</', 'coupons', 'checkFilter', 'Hãy kiểm tra lại bộ lọc hoặc thử mã khác', 'Please check your filter or try another code', 'フィルターを確認するか、別のコードを試してください'],
  ],
  'MyCoupons.tsx': [
    ['>Mã giảm giá của tôi</', 'myCoupons', 'title', 'Mã giảm giá của tôi', 'My Coupons', 'マイクーポン'],
    ['>Quản lý và sử dụng các mã ưu đãi dành riêng cho bạn</', 'myCoupons', 'desc', 'Quản lý và sử dụng các mã ưu đãi dành riêng cho bạn', 'Manage and use exclusive discount codes just for you', 'あなただけの限定割引コードを管理および使用します'],
    ['>Áp dụng</', 'common', 'apply', 'Áp dụng', 'Apply', '適用'],
    ['>Sử dụng ngay</', 'myCoupons', 'useNow', 'Sử dụng ngay', 'Use Now', '今すぐ使用'],
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
    // Only replace simple exact matches
    const replaceWith = `>{t('${ns}.${key}')}</`;
    // Trim > < for inner match if needed
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (content.match(regex)) {
      content = content.replace(regex, replaceWith);
      changed = true;
    }
  });

  // Manual regex for <button> Đổi ngay </button> containing newlines
  const textMatches = [
    { regex: />\s*Hủy\s*</g, rep: `>{t('common.cancel')}<` },
    { regex: />\s*Sửa\s*</g, rep: `>{t('common.edit')}<` },
    { regex: />\s*Xóa\s*</g, rep: `>{t('common.delete')}<` },
    { regex: />\s*Đổi ngay\s*</g, rep: `>{t('loyalty.redeemNow')}<` },
    { regex: />\s*Đang xử lý\.\.\.\s*</g, rep: `>{t('common.processing')}<` },
    { regex: />\s*Áp dụng\s*</g, rep: `>{t('common.apply')}<` },
    { regex: />\s*Sử dụng ngay\s*</g, rep: `>{t('myCoupons.useNow')}<` }
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
      // Find the functional component definition
      const fcRegex = /const [a-zA-Z0-9_]+(: React\.FC[^=]*)* = \([^)]*\) => {/;
      content = content.replace(fcRegex, match => match + '\n  const { t } = useTranslation();');
    }
    fs.writeFileSync(filePath, content);
    console.log('Updated', file);
  } else {
    console.log('No matches found for', file);
  }
}
