const fs = require('fs');
const mockDataPath = 'c:\\Users\\LE THANH CUONG\\OneDrive\\Desktop\\Lotte_Mart_Project\\fontend\\mockData.json';

const raw = fs.readFileSync(mockDataPath, 'utf8');
const data = JSON.parse(raw);

if (!data.payment_transactions) {
  data.payment_transactions = [
    {
      id: "pt_1",
      user_id: 1,
      order_id: "ord_1",
      amount: 150000,
      method: "card",
      status: "SUCCESS",
      created_at: "2023-10-15T10:30:00Z"
    }
  ];
}

if (!data.payment_methods) {
  data.payment_methods = [
    {
      id: "pm_1",
      user_id: 1,
      type: "card",
      last4: "4242",
      brand: "VISA",
      expiry: "12/26",
      is_default: true
    },
    {
      id: "pm_2",
      user_id: 1,
      type: "card",
      last4: "8801",
      brand: "Mastercard",
      expiry: "08/25",
      is_default: false
    },
    {
      id: "pm_3",
      user_id: 1,
      type: "wallet",
      brand: "MoMo",
      phone: "09** *** 123",
      is_default: false
    }
  ];
}

if (!data.loyalty_transactions) {
  data.loyalty_transactions = [
    {
      id: "lt_1",
      user_id: 1,
      points: 150,
      type: "EARN",
      source: "Order #8829",
      created_at: "2023-10-10T14:20:00Z"
    },
    {
      id: "lt_2",
      user_id: 1,
      points: -50,
      type: "REDEEM",
      source: "Coupon REDEEM",
      created_at: "2023-10-12T09:15:00Z"
    }
  ];
}

if (!data.support_tickets) {
  data.support_tickets = [
    {
      id: "t_1",
      user_id: 1,
      subject: "Đơn hàng #8829 - Thiếu sản phẩm",
      status: "PROCESSING",
      created_at: "2024-01-24T10:45:00Z"
    },
    {
      id: "t_2",
      user_id: 1,
      subject: "Yêu cầu hoàn tiền",
      status: "OPEN",
      created_at: "2024-01-24T08:00:00Z"
    }
  ];
}

if (!data.messages) {
  data.messages = [
    {
      id: "msg_1",
      ticket_id: "t_1",
      sender_type: "user",
      sender_id: 1,
      content: "Chào bạn, tôi vừa nhận đơn #8829 nhưng thiếu lọ Mật ong hữu cơ (500g) trong túi. Bạn có thể kiểm tra giúp không?",
      created_at: "2024-01-24T10:45:00Z"
    },
    {
      id: "msg_2",
      ticket_id: "t_1",
      sender_type: "admin",
      sender_id: 99,
      content: "Chào bạn! Rất tiếc vì sự cố này. Tôi đang kiểm tra nhật ký kho và xác nhận với tài xế giao hàng. Bạn có thể gửi ảnh biên nhận trong túi hàng được không?",
      created_at: "2024-01-24T10:48:00Z"
    }
  ];
}

if (!data.coupon_usage) {
  data.coupon_usage = [
    { id: "cu_1", user_id: 1, coupon_id: "WELCOME50", used_at: "2023-10-15T12:00:00Z" }
  ];
}

// ensure reviews have replies array and created_at
if (data.reviews) {
  data.reviews.forEach(r => {
    if (!r.replies) r.replies = [];
    if (!r.created_at) r.created_at = "2023-09-28T10:00:00Z";
  });
}

fs.writeFileSync(mockDataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('mockData updated!');
