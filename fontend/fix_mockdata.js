const fs = require('fs');
const path = require('path');

console.log('Reading mockData.json...');
const mockDataPath = path.join(__dirname, 'mockData.json');
const d = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

// FIX 1: Normalize messages - all to new format {id, ticket_id, sender_type, sender_id, content, created_at}
console.log('Fixing messages...');
d.messages = d.messages.map(m => {
  const result = {
    id: typeof m.id === 'number' ? 'm' + m.id : m.id,
    ticket_id: m.ticket_id,
    sender_type: m.sender_type || (m.sender === 'USER' ? 'user' : m.sender === 'ADMIN' ? 'admin' : 'user'),
    sender_id: m.sender_id || (m.sender === 'USER' || m.sender === 'user' ? 3 : 100),
    content: m.content || m.text,
    created_at: m.created_at || m.time
  };
  return result;
});

// FIX 2: Normalize support_tickets - add updated_at to all
console.log('Fixing support_tickets...');
d.support_tickets = d.support_tickets.map(t => {
  if (!t.updated_at) t.updated_at = t.created_at;
  return t;
});

// FIX 3: Normalize notifications - add type and action_url to all
console.log('Fixing notifications...');
d.notifications = d.notifications.map(n => {
  if (!n.type) n.type = 'order';
  if (!n.action_url) n.action_url = '/account/orders';
  return n;
});

// FIX 4: Normalize loyalty_transactions - add reference_id to all
console.log('Fixing loyalty_transactions...');
d.loyalty_transactions = d.loyalty_transactions.map(lt => {
  if (!lt.reference_id) lt.reference_id = lt.source.replace(/\s+/g, '_').toLowerCase().substring(0, 30);
  return lt;
});

// FIX 5: Add missing fields to reviews (likes, status)
console.log('Fixing reviews...');
d.reviews = d.reviews.map(r => {
  if (r.likes === undefined) r.likes = 0;
  if (!r.status) r.status = 'verified';
  return r;
});

// FIX 6: Add slug/description/display_order/is_active to categories
console.log('Fixing categories...');
d.categories = d.categories.map((c, i) => {
  if (!c.slug) {
    c.slug = c.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/\s+/g, '-');
  }
  if (!c.description) c.description = 'Danh mục ' + c.name;
  if (c.display_order === undefined) c.display_order = i + 1;
  if (c.is_active === undefined) c.is_active = true;
  return c;
});

console.log('Writing mockData.json...');
fs.writeFileSync(mockDataPath, JSON.stringify(d, null, 2), 'utf8');
console.log('Done! mockData.json has been normalized.');
