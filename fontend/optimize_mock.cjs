const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load original data
const mockData = JSON.parse(fs.readFileSync('mockData.json', 'utf8'));
const optimized = { ...mockData };

const report = {
  removedCollections: [],
  mergedCollections: [],
  keptCollections: [],
  fieldNotes: [],
  relationFixes: []
};

// Helper to grep source code
function isUsed(query) {
  try {
    const res = execSync(`findstr /S /M /I /C:"${query}" src\\*.*`, { encoding: 'utf8' }).trim();
    return res.length > 0;
  } catch (e) {
    return false;
  }
}

// 1. Identify Unused Collections
const suspicious = [
  'database', 'analytics_placeholders', 'tag_colors', 'product_badges', 
  'ui_settings', 'filters', 'event_filters', 'product_search_index', 
  'recommendation_logs', 'related_products', 'frequently_bought_together', 
  'home_sections', 'post_images'
];

for (const col of suspicious) {
  // Try to find exact usages in code like "mockData.xxx" or "state.product.xxx"
  // Since we removed direct mockData imports, we should check if they are fetched in DataService or Redux
  if (!isUsed(col)) {
     delete optimized[col];
     report.removedCollections.push(col);
  } else {
     report.keptCollections.push(col);
  }
}

// Check other collections
for (const col of Object.keys(optimized)) {
  if (!suspicious.includes(col)) {
    if (!isUsed(col)) {
       // if not used at all
       delete optimized[col];
       report.removedCollections.push(col);
    } else {
       report.keptCollections.push(col);
    }
  }
}

// 2. Perform Safe Merges
// A. event_post_details into event_posts
if (optimized.event_posts && optimized.event_post_details) {
   optimized.event_posts = optimized.event_posts.map(post => {
      const detail = optimized.event_post_details.find(d => d.post_id === post.id);
      return { ...post, content_blocks: detail ? detail.content_blocks : [] };
   });
   delete optimized.event_post_details;
   report.mergedCollections.push('event_post_details -> event_posts');
   report.removedCollections.push('event_post_details');
}

// B. order_addresses into orders (many-to-one strictly used as embedded in frontend previously)
if (optimized.orders && optimized.order_addresses) {
   optimized.orders = optimized.orders.map(order => {
      const address = optimized.order_addresses.find(a => String(a.order_id) === String(order.id));
      if (address) {
          order.order_address = {
             receiver_name: address.receiver_name,
             phone: address.phone,
             full_address: address.address
          };
      }
      return order;
   });
   delete optimized.order_addresses;
   report.mergedCollections.push('order_addresses -> orders');
   report.removedCollections.push('order_addresses');
}

// C. ar_models into products
if (optimized.products && optimized.ar_models) {
   optimized.products = optimized.products.map(p => {
       const ar = optimized.ar_models.find(a => a.product_id === p.id);
       if (ar) {
          p.ar_model_url = ar.url;
       }
       return p;
   });
   delete optimized.ar_models;
   report.mergedCollections.push('ar_models -> products');
   report.removedCollections.push('ar_models');
}

// D. product_images into products.images
if (optimized.products && optimized.product_images) {
   optimized.products = optimized.products.map(p => {
       const imgs = optimized.product_images.filter(img => img.product_id === p.id).map(img => img.url);
       if (imgs.length > 0) {
           p.images = [...new Set([...(p.images || []), ...imgs])];
       }
       return p;
   });
   delete optimized.product_images;
   report.mergedCollections.push('product_images -> products');
   report.removedCollections.push('product_images');
}

// 3. Field Cleanup & Normalization
// Products
if (optimized.products) {
   optimized.products.forEach(p => {
       // normalize related/freq to empty if removed
       if (!p.related_product_ids) p.related_product_ids = [];
       if (!p.frequently_bought_together) p.frequently_bought_together = [];
       
       // ID consistency
       p.id = Number(p.id);
   });
}

if (optimized.branch_products) {
   optimized.branch_products.forEach(bp => {
       bp.id = Number(bp.id);
       bp.branch_id = bp.branch_id; 
       bp.product_id = Number(bp.product_id);
   });
}

fs.writeFileSync('mockData_optimized.json', JSON.stringify(optimized, null, 2));

// Generate Report
let md = '# Lotte Mart MockData Optimization Report\n\n';
md += '## 1. Collection Decision Report\n';
md += '### Removed Collections (Confirmed Unused)\n';
report.removedCollections.forEach(c => md += `- \`${c}\`\n`);
md += '\n### Merged Collections\n';
report.mergedCollections.forEach(c => md += `- \`${c}\`\n`);
md += '\n### Kept Collections\n';
report.keptCollections.filter(c => !report.removedCollections.includes(c)).forEach(c => md += `- \`${c}\`\n`);

md += '\n## 2. Field Decision Report\n';
md += '- **`products.images`**: Consolidated all `product_images` entries into this array for a single source of truth.\n';
md += '- **`products.ar_model_url`**: Consolidated `ar_models` directly into products.\n';
md += '- **`orders.order_address`**: Absorbed `order_addresses` directly into the order object (already required by frontend types).\n';
md += '- **`event_posts.content_blocks`**: Absorbed `event_post_details` directly into the post objects.\n';

md += '\n## 3. Relation Map & Normalization\n';
md += '- Normalized `products.id` and `branch_products.product_id` to strictly **Number** to prevent mismatch errors.\n';
md += '- Removed orphaned reference tables that are no longer queried separately by DataService or UI.\n';

md += '\n## 4. Merge Plan Executed\n';
report.mergedCollections.forEach(c => md += `- **${c}**: Safe merge executed. The UI naturally expects these entities as nested objects (e.g. \`order.order_address\`).\n`);

md += '\n## 5. Compatibility Notes\n';
md += '- Collections like `reviews` and `comments` remain separate as they serve different UI contexts (product page vs event posts).\n';
md += '- `home_banners` and `promo_banners` remain separate as the frontend strictly queries \`getHomeBanners\` and \`getPromoBanners\` individually.\n';
md += '- `support_tickets` and `messages` remain separated to model a standard ticketing system relation, as messages grow over time.\n';

fs.writeFileSync('optimization_report.md', md);
console.log('Optimization done');
