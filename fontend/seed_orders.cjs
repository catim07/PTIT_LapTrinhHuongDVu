const fs = require('fs');

const dataFile = 'mockData.json';
const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// Initialize if missing
if (!db.orders) db.orders = [];

// Give existing orders the fields
db.orders.forEach((order, index) => {
  if (!order.shipping_fee && order.shipping_fee !== 0) order.shipping_fee = 30000;
  if (!order.vat_percent && order.vat_percent !== 0) order.vat_percent = 8;
  if (!order.discount_amount && order.discount_amount !== 0) order.discount_amount = 0;
  if (!order.payment) {
    order.payment = {
      method: "Momo",
      status: "PAID",
      transaction_id: "momo_" + Math.random().toString(36).substr(2, 9)
    };
  }
  if (!order.tracking) {
    order.tracking = {
      status: order.status,
      history: [
        { timestamp: order.created_at, status: "PENDING", note: "Đơn hàng đã được tạo" }
      ]
    };
    if (order.status === 'PROCESSING' || order.status === 'DELIVERED') {
      order.tracking.history.push({ timestamp: new Date(new Date(order.created_at).getTime() + 3600000).toISOString(), status: "PROCESSING", note: "Đang xử lý" });
    }
    if (order.status === 'DELIVERED') {
      order.tracking.history.push({ timestamp: new Date(new Date(order.created_at).getTime() + 86400000).toISOString(), status: "DELIVERED", note: "Giao hàng thành công" });
    }
  }
  if (!order.order_address) {
    order.order_address = {
      receiver_name: "Tên Khách Hàng",
      phone: "0901234567",
      full_address: "123 Đường Tạm, Quận 1, TP.HCM",
      lat: 10.7769,
      lng: 106.7009
    };
  }
  // Make sure some order is PENDING or PROCESSING so it can be cancelled
  if (index === 0) {
    order.status = "PENDING";
  }
});

// Update items if needed
db.orders.forEach(order => {
  order.items.forEach((item, i) => {
    if (!item.unit_price) item.unit_price = item.price || 50000;
    if (!item.subtotal) item.subtotal = item.unit_price * (item.quantity || 1);
  });
});

// Create addresses list if not exists
if (!db.user_addresses) {
  db.user_addresses = [
    {
      id: "addr_1",
      user_id: 3,
      name: "Nhà riêng",
      receiver_name: "Alice",
      phone: "0901111222",
      city: "Hồ Chí Minh",
      district: "Quận 1",
      ward: "Bến Nghé",
      street: "77 Lê Thánh Tôn",
      full_address: "77 Lê Thánh Tôn, Bến Nghé, Quận 1, Hồ Chí Minh",
      is_default: true,
      lat: 10.7766,
      lng: 106.7032
    }
  ];
}

fs.writeFileSync(dataFile, JSON.stringify(db, null, 2), 'utf8');
console.log("mockData updated with new order fields and user_addresses list.");
