const fs = require('fs');

const realPath = 'c:\\Users\\LE THANH CUONG\\OneDrive\\Desktop\\Lotte_Mart_Project\\fontend\\mockData.json';

const data = JSON.parse(fs.readFileSync(realPath, 'utf8'));

// Add replies field to existing reviews (non-destructive)
if (data.reviews) {
  data.reviews.forEach(r => {
    if (!r.replies) {
      r.replies = [];
    }
    if (!r.product_id && r.branch_product_id) {
      const bp = data.branch_products && data.branch_products.find(b => b.id === r.branch_product_id);
      if (bp) r.product_id = bp.product_id;
    }
  });
}

// Add more reviews with replies
const newReviews = [
  {
    id: "r3",
    user_id: 3,
    branch_product_id: 101,
    product_id: 1,
    rating: 5,
    comment: "San pham tuyet voi, giao hang nhanh, dong goi can than. Se mua lai!",
    created_at: "2026-02-20T14:30:00Z",
    user_name: "Nguyen Minh Tam",
    avatar: "https://i.pravatar.cc/100?img=15",
    images: [],
    replies: [
      { id: "rr1", user_id: 1, text: "Cam on ban da ung ho!", created_at: "2026-02-21T09:00:00Z" }
    ]
  },
  {
    id: "r4",
    user_id: 4,
    branch_product_id: 102,
    product_id: 2,
    rating: 4,
    comment: "Banh mi tuoi ngon, chat luong on dinh. Chi hoi nho so voi mong doi.",
    created_at: "2026-03-01T10:00:00Z",
    user_name: "Le Hoang Anh",
    avatar: "https://i.pravatar.cc/100?img=22",
    images: [],
    replies: []
  },
  {
    id: "r5",
    user_id: 3,
    branch_product_id: 103,
    product_id: 3,
    rating: 5,
    comment: "Sua tuoi rat ngon, con toi rat thich uong. Chat luong Lotte khong phai ban cai.",
    created_at: "2026-03-05T16:45:00Z",
    user_name: "Pham Thu Ha",
    avatar: "https://i.pravatar.cc/100?img=33",
    images: [],
    replies: [
      { id: "rr2", user_id: 1, text: "Cam on ban rat nhieu!", created_at: "2026-03-06T08:00:00Z" }
    ]
  },
  {
    id: "r6",
    user_id: 4,
    branch_product_id: 101,
    product_id: 1,
    rating: 3,
    comment: "San pham OK nhung gia hoi cao. Mong co nhieu khuyen mai hon.",
    created_at: "2026-03-10T11:20:00Z",
    user_name: "Vu Duc Huy",
    avatar: "https://i.pravatar.cc/100?img=44",
    images: [],
    replies: []
  }
];

newReviews.forEach(nr => {
  if (!data.reviews.find(r => r.id === nr.id)) {
    data.reviews.push(nr);
  }
});

// Add more notifications
const newNotifications = [
  {
    id: 2,
    user_id: 3,
    title: "Don hang da giao thanh cong",
    message: "Don hang #ORD001 da duoc giao den dia chi cua ban.",
    type: "order",
    is_read: false,
    action_url: "/account/orders/1",
    created_at: "2026-03-15T10:00:00Z"
  },
  {
    id: 3,
    user_id: 3,
    title: "Khuyen mai dac biet",
    message: "Giam 30% cho tat ca san pham sua trong tuan nay!",
    type: "promotion",
    is_read: false,
    action_url: "/products",
    created_at: "2026-03-17T08:00:00Z"
  },
  {
    id: 4,
    user_id: 3,
    title: "Diem thuong sap het han",
    message: "Ban co 150 diem Lotte se het han vao ngay 31/03.",
    type: "loyalty",
    is_read: true,
    action_url: "/account/coupons",
    created_at: "2026-03-12T15:30:00Z"
  },
  {
    id: 5,
    user_id: 3,
    title: "Danh gia san pham",
    message: "Ban vua nhan hang! Hay danh gia san pham de nhan them 10 diem thuong.",
    type: "review",
    is_read: false,
    action_url: "/products/1",
    created_at: "2026-03-16T12:00:00Z"
  }
];

newNotifications.forEach(nn => {
  if (!data.notifications.find(n => n.id === nn.id)) {
    data.notifications.push(nn);
  }
});

data.notifications.forEach(n => {
  if (typeof n.is_read === 'undefined') n.is_read = false;
});

fs.writeFileSync(realPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Done! Reviews:', data.reviews.length, 'Notifications:', data.notifications.length);
