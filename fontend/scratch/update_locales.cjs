const fs = require('fs');

const viPath = './src/i18n/locales/vi.json';
const enPath = './src/i18n/locales/en.json';
const jaPath = './src/i18n/locales/ja.json';

const translations = {
  vi: {
    importOrders: {
      createProductTitle: "Tạo sản phẩm mới nhanh",
      createProductSubtitle: "Sản phẩm sẽ được thêm vào hệ thống và có thể chọn ngay",
      createBtn: "Tạo nhanh",
      basicInfo: "Thông tin cơ bản",
      productName: "Tên sản phẩm",
      productNamePlaceholder: "Nhập tên sản phẩm...",
      referencePrice: "Giá bán tham khảo (đ)",
      supplier: "Nhà cung cấp",
      noSelection: "-- Không chọn --",
      errorEmptyName: "Vui lòng nhập tên sản phẩm",
      errorSelectBranch: "Vui lòng chọn chi nhánh trước khi tạo sản phẩm",
      successCreate: "Tạo sản phẩm mới thành công. Sản phẩm đã được tự động thêm vào đơn!",
      errorCreate: "Không thể tạo sản phẩm",
      errorLoadProducts: "Không tải được danh sách sản phẩm",
      createNew: "+ Tạo mới",
      loadingProducts: "Đang tải...",
      selectAvailable: "Chọn sản phẩm có sẵn..."
    }
  },
  en: {
    importOrders: {
      createProductTitle: "Quick Create Product",
      createProductSubtitle: "The product will be added to the system and can be selected immediately",
      createBtn: "Quick Create",
      basicInfo: "Basic Information",
      productName: "Product Name",
      productNamePlaceholder: "Enter product name...",
      referencePrice: "Reference Price (VND)",
      supplier: "Supplier",
      noSelection: "-- None --",
      errorEmptyName: "Please enter a product name",
      errorSelectBranch: "Please select a branch before creating a product",
      successCreate: "Product created successfully. It has been automatically added to the order!",
      errorCreate: "Failed to create product",
      errorLoadProducts: "Failed to load product list",
      createNew: "+ Create New",
      loadingProducts: "Loading...",
      selectAvailable: "Select available product..."
    }
  },
  ja: {
    importOrders: {
      createProductTitle: "製品のクイック作成",
      createProductSubtitle: "製品はシステムに追加され、すぐに選択できるようになります",
      createBtn: "クイック作成",
      basicInfo: "基本情報",
      productName: "製品名",
      productNamePlaceholder: "製品名を入力...",
      referencePrice: "参考価格（VND）",
      supplier: "サプライヤー",
      noSelection: "-- 選択なし --",
      errorEmptyName: "製品名を入力してください",
      errorSelectBranch: "製品を作成する前に店舗を選択してください",
      successCreate: "製品が正常に作成されました。注文に自動的に追加されました！",
      errorCreate: "製品の作成に失敗しました",
      errorLoadProducts: "製品リストの読み込みに失敗しました",
      createNew: "+ 新規作成",
      loadingProducts: "読み込み中...",
      selectAvailable: "既存の製品を選択..."
    }
  }
};

const updateDict = (path, lang) => {
  let data = {};
  if (fs.existsSync(path)) {
    data = JSON.parse(fs.readFileSync(path, 'utf8'));
  }
  data.importOrders = { ...data.importOrders, ...translations[lang].importOrders };
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
};

updateDict(viPath, 'vi');
updateDict(enPath, 'en');
updateDict(jaPath, 'ja');
console.log('Done');
