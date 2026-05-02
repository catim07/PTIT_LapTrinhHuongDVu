const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, 'mockData.json');
const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

if (!mockData.orders) {
  mockData.orders = [
    {
      id: "LM_1001",
      user_id: 2,
      branch_id: "HCM_01",
      subtotal: 500000,
      shipping_fee: 30000,
      discount_amount: 50000,
      total_amount: 480000,
      status: "PENDING",
      payment_method: "VNPAY",
      payment_status: "PAID",
      shipping_method: "STANDARD",
      note: "Giao đúng hẹn giùm mình",
      customer_note: "Nhờ bọc kỹ vì là đồ dễ vỡ",
      applied_coupon_code: "WELCOME50",
      tracking_number: "GHTK123456",
      shipping_provider: "GHTK",
      items: [
        {
          branch_product_id: "bp_1",
          quantity: 2,
          price: 250000,
          product_name: "Sữa Tươi TH True Milk 1 Lít (Lốc 4 hộp)",
          product_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVmkxjiHZJ0qzW4maIDXZUJhmLhpCWeliFgGdVli7aOsKaTnf5HFNJ4vh6KgaUXdL9JR92r47ndhSJ-tUeNvDzZaYuC2xiGZtc6sE8pHRikoRQHdXM-qD_8SqwdHUazaF2JdrSEiHdtjHpD2n9ZAwbxUgiMIAXic1WXbFPzbroNgYISmm1WYPpl_OmjKOH4w176bxJWMpqSiJKPJ_fcPcC2nOHdlY1d7OhUgHUiXYrVOt-QgjLoNRwJGNhOK6KNQkTq7chG0qjaYw"
        }
      ],
      order_address: {
        receiver_name: "Lê Cường",
        phone: "0909123456",
        full_address: "469 Nguyễn Hữu Thọ, Q.7, TP.HCM"
      },
      payment: {
        method: "VNPAY",
        transaction_id: "VNP567890",
        status: "COMPLETED"
      },
      timeline: [
        { status: "PENDING", note: "Đơn hàng mới tạo", timestamp: new Date(Date.now() - 3600000 * 24).toISOString() }
      ],
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "LM_1002",
      user_id: 3,
      branch_id: "HN_01",
      subtotal: 120000,
      shipping_fee: 15000,
      discount_amount: 0,
      total_amount: 135000,
      status: "DELIVERED",
      payment_method: "COD",
      payment_status: "PAID",
      shipping_method: "EXPRESS",
      note: "",
      tracking_number: "LM_EXP_002",
      shipping_provider: "AHA_MOVE",
      items: [
        {
          branch_product_id: "bp_5",
          quantity: 1,
          price: 120000,
          product_name: "Lotte Mart Burger - Combo Family",
          product_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvCmZq2gs_x--m3j0GBpEp2jD-G3tKkGfEuJs5vu4DStp0Zbu-pU1AOCwliJDSGh39AMzDVCLH-y3TiibG0Bl4CWSwInluAwWcXVJHT_Cu2tivr1VGeay4U5Vppz9XGBd8fgYKQ_l65XdorNUQqCN8MDAdvBMg1KOVMFJTd5MSW68hHULOKcOPBn9MpbHSdZz0fbZZGA9UWYZprFFTe7oF-WewtGYYxYMEMuqG6a7I8XQ_F2pVNtRBRs37B1J5vHFBKgO8RtTfQt0"
        }
      ],
      order_address: {
        receiver_name: "Nguyễn Văn A",
        phone: "0987654321",
        full_address: "Tòa nhà Lotte Center, Đào Tấn, Hà Nội"
      },
      payment: {
        method: "COD",
        status: "COMPLETED"
      },
      timeline: [
        { status: "PENDING", note: "Đơn hàng mới tạo", timestamp: new Date(Date.now() - 3600000 * 48).toISOString() },
        { status: "SHIPPING", note: "Đang giao bằng Grab", timestamp: new Date(Date.now() - 3600000 * 46).toISOString() },
        { status: "DELIVERED", note: "Khách đã nhận", timestamp: new Date(Date.now() - 3600000 * 45).toISOString() }
      ],
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 45).toISOString()
    },
    {
      id: "LM_1003",
      user_id: 4,
      branch_id: "HCM_02",
      subtotal: 2500000,
      shipping_fee: 0,
      discount_amount: 200000,
      total_amount: 2300000,
      status: "CANCELLED",
      cancel_reason: "Đổi ý muốn mua thêm",
      refund_status: "COMPLETED",
      refund_reason: "Hoàn tự động",
      payment_method: "CARD",
      payment_status: "REFUNDED",
      shipping_method: "STANDARD",
      note: "",
      items: [
        {
          branch_product_id: "bp_10",
          quantity: 1,
          price: 2500000,
          product_name: "Mỹ Phẩm Cao Cấp Ohui",
          product_image: "https://via.placeholder.com/150"
        }
      ],
      order_address: {
        receiver_name: "Trần Thị C",
        phone: "0912345678",
        full_address: "123 Lê Lợi, Q.1, TP.HCM"
      },
      payment: {
        method: "VISA",
        status: "REFUNDED",
        transaction_id: "REF_VIS_001"
      },
      timeline: [
        { status: "PENDING", note: "Đơn hàng mới tạo", timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
        { status: "CANCELLED", note: "Khách đổi ý muốn mua thêm", timestamp: new Date(Date.now() - 3600000 * 11).toISOString() }
      ],
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 11).toISOString()
    },
    {
      id: "LM_1004",
      user_id: 2,
      branch_id: "HCM_01",
      subtotal: 450000,
      shipping_fee: 15000,
      discount_amount: 0,
      total_amount: 465000,
      status: "SHIPPING",
      payment_method: "COD",
      payment_status: "UNPAID",
      shipping_method: "STANDARD",
      note: "",
      items: [
        {
          branch_product_id: "bp_7",
          quantity: 5,
          price: 90000,
          product_name: "Trái Cây Nhập Khẩu",
          product_image: "https://via.placeholder.com/150"
        }
      ],
      order_address: {
        receiver_name: "Lê Cường",
        phone: "0909123456",
        full_address: "469 Nguyễn Hữu Thọ, Q.7, TP.HCM"
      },
      payment: {
        method: "COD",
        status: "UNPAID"
      },
      timeline: [
        { status: "PENDING", note: "Đơn hàng mới tạo", timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
        { status: "CONFIRMED", note: "Nhân viên xác nhận", timestamp: new Date(Date.now() - 3600000 * 1).toISOString() },
        { status: "SHIPPING", note: "Giao cho shipper", timestamp: new Date().toISOString() }
      ],
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  fs.writeFileSync(mockDataPath, JSON.stringify(mockData, null, 2), 'utf8');
  console.log("Mock orders added to mockData.json");
} else {
  console.log("mockData already contains orders.");
}
