const fs = require('fs');
const path = require('path');

const mockPath = path.join(__dirname, 'mockData.json');

const d = JSON.parse(fs.readFileSync(mockPath, 'utf8'));

// 1. Add payment_methods
if (!d.payment_methods) {
  d.payment_methods = [
    { id: "pm1", user_id: 3, type: "card", last4: "4242", brand: "VISA", expiry: "12/26", holder_name: "NGUYỄN VĂN A", is_default: true },
    { id: "pm2", user_id: 3, type: "card", last4: "8801", brand: "Mastercard", expiry: "08/25", holder_name: "NGUYỄN VĂN A", is_default: false },
    { id: "pm3", user_id: 3, type: "ewallet", last4: "123", brand: "MoMo", holder_name: "NGUYỄN VĂN A", is_default: false },
    { id: "pm4", user_id: 1, type: "card", last4: "9999", brand: "VISA", expiry: "06/27", holder_name: "ADMIN", is_default: true }
  ];
}

// 2. Add coupon_usage
if (!d.coupon_usage) {
  d.coupon_usage = [
    { id: "cu1", user_id: 3, coupon_id: "c2", used_at: "2023-10-15T10:00:00Z" }
  ];
}

// 3. Extend reviews with replies and created_at if missing
d.reviews = d.reviews.map(r => ({
  ...r,
  replies: r.replies || [],
  created_at: r.created_at || "2023-10-12T08:00:00Z"
}));

// 4. Add more loyalty_transactions 
const existingLoyaltyIds = d.loyalty_transactions.map(t => t.id);
const newLoyaltyTx = [
  { id: "lp3", user_id: 3, points: 450, type: "EARN", source: "Mua sắm thực phẩm - Chi nhánh Seoul", reference_id: "ord_food_1", created_at: "2023-10-24T09:00:00Z" },
  { id: "lp4", user_id: 3, points: -1200, type: "REDEEM", source: "Đổi voucher (Starbucks)", reference_id: "redeem_sb_1", created_at: "2023-10-21T14:00:00Z" },
  { id: "lp5", user_id: 3, points: 820, type: "EARN", source: "Giao hàng tươi hàng tuần", reference_id: "ord_fresh_1", created_at: "2023-10-18T10:00:00Z" },
  { id: "lp6", user_id: 3, points: 2500, type: "BONUS", source: "Thưởng giới thiệu - John Doe", reference_id: "ref_john", created_at: "2023-10-12T08:30:00Z" },
  { id: "lp7", user_id: 3, points: 9880, type: "EARN", source: "Mua sắm tích lũy đầu năm", reference_id: "ord_aggregate", created_at: "2023-06-01T08:00:00Z" }
].filter(t => !existingLoyaltyIds.includes(t.id));
d.loyalty_transactions = [...d.loyalty_transactions, ...newLoyaltyTx];

// 5. Add more support_tickets
const existingTicketIds = d.support_tickets.map(t => t.id);
const newTickets = [
  { id: "t2", user_id: 3, subject: "Yêu cầu hoàn tiền", status: "OPEN", created_at: "2024-01-24T08:00:00Z", updated_at: "2024-01-24T10:00:00Z" },
  { id: "t3", user_id: 3, subject: "Hỏi về nhận hàng tại cửa hàng", status: "CLOSED", created_at: "2024-01-23T09:00:00Z", updated_at: "2024-01-23T15:00:00Z" },
  { id: "t4", user_id: 3, subject: "Lỗi đăng nhập ứng dụng", status: "CLOSED", created_at: "2024-01-21T10:00:00Z", updated_at: "2024-01-22T11:00:00Z" }
].filter(t => !existingTicketIds.includes(t.id));
d.support_tickets = [...d.support_tickets, ...newTickets];

// 6. Add more messages
const existingMsgIds = d.messages.map(m => m.id);
const newMessages = [
  { id: 3, ticket_id: "t1", sender_type: "user", sender_id: 3, content: "Chắc chắn rồi, đây là ảnh biên nhận.", created_at: "2024-01-25T09:15:00Z" },
  { id: 4, ticket_id: "t1", sender_type: "admin", sender_id: 100, content: "Cảm ơn bạn. Tôi đã xác nhận mặt hàng bị đánh dấu 'Hết hàng' ngay khi tài xế rời kho. Chúng tôi đang liên hệ với đơn vị vận chuyển.", created_at: "2024-01-25T09:30:00Z" },
  { id: 5, ticket_id: "t2", sender_type: "user", sender_id: 3, content: "Thẻ tín dụng của tôi bị trừ tiền hai lần cho giao dịch gần nhất.", created_at: "2024-01-24T08:10:00Z" },
  { id: 6, ticket_id: "t3", sender_type: "user", sender_id: 3, content: "Tôi muốn hỏi về việc nhận hàng tại cửa hàng Lotte Mart quận 7.", created_at: "2024-01-23T09:05:00Z" },
  { id: 7, ticket_id: "t3", sender_type: "admin", sender_id: 100, content: "Vấn đề đã được giải quyết. Khách hàng đã nhận hàng.", created_at: "2024-01-23T14:00:00Z" },
  { id: 8, ticket_id: "t4", sender_type: "user", sender_id: 3, content: "Tôi không thể đăng nhập vào tài khoản kể từ bản cập nhật gần nhất.", created_at: "2024-01-21T10:05:00Z" }
].filter(m => !existingMsgIds.includes(m.id));
d.messages = [...d.messages, ...newMessages];

// 7. Extend coupons - keep existing, ensure consistent structure + add new ones
d.coupons = d.coupons.map(c => ({
  ...c,
  description: c.description || '',
  discount_type: c.discount_type || c.type || 'PERCENT',
  discount_value: c.discount_value !== undefined ? c.discount_value : (c.value || 0),
  min_order_value: c.min_order_value !== undefined ? c.min_order_value : (c.min_order || 0),
  max_discount_value: c.max_discount_value || 0,
  start_date: c.start_date || '2023-09-01',
  end_date: c.end_date || '2023-12-31',
  usage_limit: c.usage_limit || 100,
  used_count: c.used_count || 0,
  eligible_branch_ids: c.eligible_branch_ids || []
}));

const existingCouponCodes = d.coupons.map(c => c.code);
const newCoupons = [
  { id: "c3", code: "GIAM10", description: "Giảm 10% cho đơn hàng thời trang nam", discount_type: "percent", discount_value: 10, min_order_value: 500000, max_discount_value: 100000, start_date: "2023-10-01", end_date: "2023-12-31", usage_limit: 500, used_count: 100, eligible_branch_ids: [] },
  { id: "c4", code: "WELCOME50", description: "Giảm 50.000đ cho khách hàng mới", discount_type: "fixed", discount_value: 50000, min_order_value: 200000, max_discount_value: 50000, start_date: "2023-01-01", end_date: "2023-12-31", usage_limit: 1, used_count: 1, eligible_branch_ids: [] },
  { id: "c5", code: "FREESHIP", description: "Miễn phí vận chuyển toàn quốc", discount_type: "freeship", discount_value: 0, min_order_value: 0, max_discount_value: 50000, start_date: "2023-10-01", end_date: "2023-11-30", usage_limit: 1000, used_count: 200, eligible_branch_ids: [] },
  { id: "c6", code: "SALE20", description: "Ưu đãi giảm giá 20% tháng 9", discount_type: "percent", discount_value: 20, min_order_value: 1000000, max_discount_value: 200000, start_date: "2023-09-01", end_date: "2023-09-30", usage_limit: 200, used_count: 200, eligible_branch_ids: [] }
].filter(c => !existingCouponCodes.includes(c.code));
d.coupons = [...d.coupons, ...newCoupons];

// Add coupon usage for WELCOME50
if (!d.coupon_usage.find(u => u.coupon_id === 'c4')) {
  d.coupon_usage.push({ id: "cu2", user_id: 3, coupon_id: "c4", used_at: "2023-10-15T10:00:00Z" });
}

// 8. Add more reviews for user 3
const existingRevIds = d.reviews.map(r => r.id);
const newReviews = [
  {
    id: "r10", user_id: 3, product_id: 1, branch_product_id: "bp-HCM01-1",
    rating: 5, comment: "Khử tiếng ồn tuyệt vời. Dùng trong chuyến bay 12 tiếng mà pin vẫn còn hơn 50%. Mua sắm tốt nhất năm nay!",
    user_name: "Alex Nguyen", avatar: "https://i.pravatar.cc/100?img=12",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBY9HnPhg4Dne0JAJHDml6G7RNyPXjp5PXkUMoy5265yWOQyRAIzkhdvjhvfqocjNKY8691gA298FwnTSHNra27hTkX0y0_Mv19ctLdtOcJvGXpuC7HHqcz6VW3iI5oJ5oBpmr_72iBS5IlQG3_r7BDkjYlpUv9HR8B7n4XPLZ6H5g7djNKTKt2ccWm3UB4AOpO0UuW9Ck6y63lJH9E7VGqYxd9FONwkKmwC6meLSbzrhKgU9KNH6qmR4Miz1RQJbUZR5keH77JUa0"],
    likes: 24, status: "delivered", replies: [], created_at: "2023-10-12T08:00:00Z"
  },
  {
    id: "r11", user_id: 3, product_id: 2, branch_product_id: "bp-HCM01-2",
    rating: 4, comment: "Sang trọng và đơn giản. Dây da chất lượng cao, nhưng mất vài ngày để mềm. Nhìn đắt hơn giá thực tế.",
    user_name: "Alex Nguyen", avatar: "https://i.pravatar.cc/100?img=12",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBrHQW8DS4FkZYYC2C-NgaWRjB49mi3y5lE8LBmwE-yMgdmh74bori7Hr0774x-SeV3J8JjH4-bbdkzHDDzEaxR5v2jANusDmvRQEGr-kBecWBkBnjoMaMVXNvF-dBMZPYNgW3wZCALGxloLaVilB0pD2KZeI-I38BGbrB_BKHRo1ZgwCicDPUNBcOE3uiVgyKOMZe5iWj5lsKoa8kw12jJmtxk9CtdSIxSN0SFn8NKraZWQEzVSWUrF_b4RtTrF19S09nCla4JuEI"],
    likes: 12, status: "verified", replies: [], created_at: "2023-09-28T14:00:00Z"
  },
  {
    id: "r12", user_id: 3, product_id: 3, branch_product_id: "bp-HCM01-3",
    rating: 5, comment: "Nhẹ và thoáng khí cực kỳ. Hoàn hảo cho buổi chạy 5km sáng. Nên chọn lớn hơn nửa size vì giày hơi nhỏ.",
    user_name: "Alex Nguyen", avatar: "https://i.pravatar.cc/100?img=12",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDQjTrXyq5NsYlOb5T_GOrsNtLobjNw4cLNOHmD6KtdmnIJziVMlUMOAQFAF6yfN8qPl0j4nKB92PVSAqOnHPsH9dwNRCphGyxcSN-mR79Whlj95ED_FkwsoEzYEWI6ZtwgxFZClQ1UFVaAFLHp4M8o0lsxjoRIA7jMxSNZS66N6tvU_iNG9LTJ6Jras3dMkfvbp4uoAYnzVhp4JhBECQfwhujKxqGHIH5hc6w3pN5tua-CxmJhrKQwB5J-decamkXBfX_FlCBqHuI"],
    likes: 8, status: "delivered", replies: [], created_at: "2023-08-15T10:00:00Z"
  }
].filter(r => !existingRevIds.includes(r.id));
d.reviews = [...d.reviews, ...newReviews];

fs.writeFileSync(mockPath, JSON.stringify(d, null, 2), 'utf8');
console.log('mockData.json updated successfully');
console.log('payment_methods:', d.payment_methods.length);
console.log('coupon_usage:', d.coupon_usage.length);
console.log('coupons:', d.coupons.length);
console.log('reviews:', d.reviews.length);
console.log('loyalty_transactions:', d.loyalty_transactions.length);
console.log('support_tickets:', d.support_tickets.length);
console.log('messages:', d.messages.length);
