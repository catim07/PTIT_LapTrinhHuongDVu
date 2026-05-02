const fs = require('fs');
const path = require('path');

const mockPath = path.join(__dirname, 'mockData.json');
let data = JSON.parse(fs.readFileSync(mockPath, 'utf-8'));

data.users = data.users.map(u => {
  return {
    ...u,
    full_name: u.full_name || u.username || 'Người dùng',
    avatar: u.avatar || 'https://i.pravatar.cc/100?img=12',
    dob: u.dob || '1990-01-01',
    gender: u.gender || 'male',
    bio: u.bio || 'Mô tả ngắn...',
    profile_completed: u.profile_completed !== undefined ? u.profile_completed : true,
    default_payment_method: u.default_payment_method || { "type": "card", "last4": "4242", "brand": "Visa", "card_id": "card_1" },
    wallet_balance: u.wallet_balance !== undefined ? u.wallet_balance : 50000,
    social_links: u.social_links || { "facebook": null, "google": "g_12345" }
  };
});

fs.writeFileSync(mockPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('Updated mockData.json successfully');
