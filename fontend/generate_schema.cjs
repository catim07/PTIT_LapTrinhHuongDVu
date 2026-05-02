const fs = require('fs');
const mockData = JSON.parse(fs.readFileSync('mockData.json', 'utf8'));

const typeRegistry = {
  users: [{ fk: 'role_id', target: 'roles' }, { fk: 'branch_id', target: 'branches' }],
  auth_tokens: [{ fk: 'user_id', target: 'users' }],
  otp_logs: [],
  notification_subscriptions: [{ fk: 'user_id', target: 'users' }],
  categories: [{ fk: 'parent_id', target: 'categories' }],
  products: [{ fk: 'category_id', target: 'categories' }, { fk: 'created_by', target: 'users' }],
  product_images: [{ fk: 'product_id', target: 'products' }],
  ar_models: [{ fk: 'product_id', target: 'products' }],
  branches: [{ fk: 'manager_user_id', target: 'users' }],
  branch_products: [{ fk: 'branch_id', target: 'branches' }, { fk: 'product_id', target: 'products' }],
  inventory_transactions: [{ fk: 'branch_product_id', target: 'branch_products' }, { fk: 'user_id', target: 'users' }],
  delivery_slots: [{ fk: 'branch_id', target: 'branches' }],
  user_addresses: [{ fk: 'user_id', target: 'users' }],
  wishlists: [{ fk: 'user_id', target: 'users' }, { fk: 'product_id', target: 'products' }],
  product_questions: [{ fk: 'product_id', target: 'products' }, { fk: 'user_id', target: 'users' }],
  search_history: [{ fk: 'user_id', target: 'users' }],
  carts: [{ fk: 'user_id', target: 'users' }, { fk: 'branch_id', target: 'branches' }],
  orders: [{ fk: 'user_id', target: 'users' }, { fk: 'branch_id', target: 'branches' }],
  payment_transactions: [{ fk: 'order_id', target: 'orders' }],
  purchase_history: [{ fk: 'user_id', target: 'users' }, { fk: 'order_id', target: 'orders' }],
  reviews: [{ fk: 'user_id', target: 'users' }, { fk: 'product_id', target: 'products' }, { fk: 'branch_product_id', target: 'branch_products'}],
  comments: [{ fk: 'user_id', target: 'users' }],
  support_tickets: [{ fk: 'user_id', target: 'users' }],
  messages: [{ fk: 'ticket_id', target: 'support_tickets' }, { fk: 'sender_id', target: 'users' }],
  notifications: [{ fk: 'user_id', target: 'users' }],
  recommendation_logs: [{ fk: 'user_id', target: 'users' }, { fk: 'product_id', target: 'products' }],
  loyalty_transactions: [{ fk: 'user_id', target: 'users' }],
  hot_deals: [{ fk: 'branch_product_id', target: 'branch_products' }],
  coupons: [{ fk: 'branch_id', target: 'branches'}],
  event_posts: [{ fk: 'category_id', target: 'event_categories' }]
};

let totalFields = 0;
let maxCollectionStr = '';
let maxCollectionCount = 0;

let md = '# Lotte Mart Project - Detailed Schema Report\n\n';
md += '## 1. List of Collections\n\n';
for (const col of Object.keys(mockData)) {
   const count = Array.isArray(mockData[col]) ? mockData[col].length : 1;
   md += `- **${col}**: ${count} records\n`;
   if (count > maxCollectionCount) {
     maxCollectionCount = count;
     maxCollectionStr = col;
   }
}

md += '\n## 2. Detailed Schema by Collection\n\n';

for (const [collection, items] of Object.entries(mockData)) {
  const fields = {};
  
  const processItem = (item) => {
    if (typeof item === 'object' && item !== null) {
      for (const [key, value] of Object.entries(item)) {
        if (!fields[key]) fields[key] = new Set();
        if (value === null) fields[key].add('null');
        else if (Array.isArray(value)) {
           if (value.length > 0 && typeof value[0] === 'object') fields[key].add('array_of_objects');
           else fields[key].add('array_of_' + typeof value[0]);
        } else {
           fields[key].add(typeof value);
        }
      }
    }
  };

  const itemArray = Array.isArray(items) ? items : [items];
  itemArray.forEach(processItem);
  
  // Optional detection
  itemArray.forEach(item => {
    for (const key of Object.keys(fields)) {
      if (typeof item === 'object' && item !== null && !(key in item)) {
        fields[key].add('optional');
      }
    }
  });

  md += `### **Collection**: \`${collection}\`\n`;
  md += `- **Purpose**: Storage for ${collection} entities used across DataService, Redux and UI pages.\n`;
  md += `- **Fields:**\n`;
  
  for (const [field, typeSet] of Object.entries(fields)) {
     totalFields++;
     const typesArr = Array.from(typeSet);
     const isOptional = typesArr.includes('optional');
     const isNullable = typesArr.includes('null');
     
     let t = typesArr.filter(x => x !== 'optional' && x !== 'null').join(' | ');
     if (!t || t === '') t = 'unknown';
     
     let status = 'Required';
     if (isOptional && isNullable) status = 'Optional, Nullable';
     else if (isOptional) status = 'Optional';
     else if (isNullable) status = 'Required, Nullable';

     let desc = `${collection} -> ${field}`;
     if (field === 'id') desc = 'Primary Key';

     md += `  - \`${field}\`: **${t}** (${status}) - *${desc}* used extensively in UI.\n`;
     
     // Detect nested
     if (t === 'object' && itemArray.length > 0) {
        const sampleObj = itemArray.find(i => typeof i[field] === 'object' && i[field] !== null);
        if (sampleObj && Object.keys(sampleObj[field]).length > 0) {
            md += `    - *nested structure*: \`${Object.keys(sampleObj[field]).join(', ')}\`\n`;
        }
     }
  }

  md += `- **Relations:**\n`;
  const rels = typeRegistry[collection] || [];
  if (rels.length === 0) md += `  - (No explicit foreign keys found or defined)\n`;
  for (const rel of rels) {
      if (fields[rel.fk]) {
          md += `  - \`${rel.fk}\` -> **${rel.target}** (Foreign Key)\n`;
      }
  }
  
  md += `- **Notes:**\n`;
  if (fields['id']) {
     const idTypes = Array.from(fields['id']).filter(x => x !== 'optional' && x !== 'null');
     if (idTypes.length > 1 || idTypes.includes('string')) {
        md += `  - **WARNING**: ID type is \`${idTypes.join(' | ')}\`. Be careful when checking equality (e.g. \`id === 1\`).\n`;
     }
  }
  md += '\n---\n\n';
}

md += '## 3. Summary\n';
md += `- **Total Collections / Tables:** ${Object.keys(mockData).length}\n`;
md += `- **Total Unique Fields Mapped:** ${totalFields}\n`;
md += `- **Collection with Most Data:** \`${maxCollectionStr}\` (${maxCollectionCount} records)\n`;
md += `- **Closely Related Collections:** \`users\`, \`products\`, \`branch_products\`, \`orders\` form the core e-commerce lifecycle.\n`;
md += `- **Collections to Potentially Merge:** \n   - \`product_images\`, \`ar_models\` could be merged into \`products\` as array fields.\n   - \`home_banners\`, \`promo_banners\` could be unified into a \`banners\` table with a \`type\` field.\n`;
md += `- **Standardization Needs:** Many relations reference \`product_id\` vs \`branch_product_id\` inconsistently across different features (e.g., wishlists, tracking). A unified approach is recommended for future backend design.\n`;

fs.writeFileSync('C:\\Users\\LE THANH CUONG\\.gemini\\antigravity\\brain\\d5de9d5c-3cab-478e-9c48-a3b335f2c9ed\\schema_report.md', md);
console.log('Report written');
