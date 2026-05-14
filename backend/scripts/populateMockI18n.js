import fs from 'fs';
import path from 'path';

const basePath = path.resolve('i18n', 'content');
const enPath = path.join(basePath, 'en.json');
const jaPath = path.join(basePath, 'ja.json');

const updateLocale = (p, updates) => {
  let data = JSON.parse(fs.readFileSync(p, 'utf8'));

  Object.entries(updates.category).forEach(([k, v]) => {
    data.entities.category.byName[k] = { name: v };
  });

  Object.entries(updates.product).forEach(([k, v]) => {
    data.entities.product.byName[k] = { name: v, short_description: v + ' description' };
  });

  fs.writeFileSync(p, JSON.stringify(data, null, 2));
};

updateLocale(enPath, {
  category: {
    "Thịt, Cá, Hải Sản": "Meat, Fish, Seafood",
    "Rau Củ Quả": "Vegetables & Fruits",
    "Thực phẩm đóng hộp": "Canned Food",
    "Sữa và Các sản phẩm từ sữa": "Milk & Dairy",
    "Gia Vị, Nước Chấm": "Spices & Sauces",
    "Bánh Kẹo, Snack": "Snacks & Sweets",
    "Đồ Uống": "Beverages",
    "Đồ Dùng Gia Đình": "Household Items",
    "Mì, Miến, Cháo, Phở": "Noodles & Porridge",
    "Thực phẩm chay": "Vegetarian Food",
    "Gạo, Bột, Đồ khô": "Rice & Dry Food",
    "Chăm sóc cá nhân": "Personal Care"
  },
  product: {
    "Thịt Bò Mỹ": "US Beef",
    "Cá Hồi Na Uy": "Norwegian Salmon",
    "Nước mắm Nam Ngư": "Nam Ngu Fish Sauce",
    "Sữa tươi Vinamilk": "Vinamilk Fresh Milk",
    "Bia Heineken": "Heineken Beer",
    "Mì Hảo Hảo": "Hao Hao Noodles",
    "Coca Cola": "Coca Cola",
    "Gạo ST25": "ST25 Rice",
    "Cà chua Đà Lạt": "Da Lat Tomatoes",
    "Thịt Heo CP": "CP Pork"
  }
});

updateLocale(jaPath, {
  category: {
    "Thịt, Cá, Hải Sản": "肉・魚・シーフード",
    "Rau Củ Quả": "野菜・果物",
    "Thực phẩm đóng hộp": "缶詰食品",
    "Sữa và Các sản phẩm từ sữa": "牛乳・乳製品",
    "Gia Vị, Nước Chấm": "調味料・ソース",
    "Bánh Kẹo, Snack": "お菓子・スナック",
    "Đồ Uống": "飲料",
    "Đồ Dùng Gia Đình": "家庭用品",
    "Mì, Miến, Cháo, Phở": "麺類・おかゆ",
    "Thực phẩm chay": "ベジタリアンフード",
    "Gạo, Bột, Đồ khô": "米・乾物",
    "Chăm sóc cá nhân": "パーソナルケア"
  },
  product: {
    "Thịt Bò Mỹ": "アメリカ産牛肉",
    "Cá Hồi Na Uy": "ノルウェー産サーモン",
    "Nước mắm Nam Ngư": "ナムグー ヌクマム",
    "Sữa tươi Vinamilk": "ビナミルク フレッシュミルク",
    "Bia Heineken": "ハイネケンビール",
    "Mì Hảo Hảo": "ハオハオ ヌードル",
    "Coca Cola": "コカ・コーラ",
    "Gạo ST25": "ST25米",
    "Cà chua Đà Lạt": "ダラット産トマト",
    "Thịt Heo CP": "CP豚肉"
  }
});

console.log('Backend i18n mock data injected.');
