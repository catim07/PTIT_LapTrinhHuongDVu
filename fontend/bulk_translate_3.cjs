const fs = require('fs');
const path = require('path');

const DIR = './src/pages';
const viDictPath = './src/i18n/locales/vi.json';
const enDictPath = './src/i18n/locales/en.json';
const jaDictPath = './src/i18n/locales/ja.json';

const mappings = {
  'EventDetail.tsx': [
    ['>Nguyên liệu cần chuẩn bị</', 'event', 'ingredients', 'Nguyên liệu cần chuẩn bị', 'Ingredients needed', '必要な材料'],
    ['>Cách thực hiện chi tiết</', 'event', 'steps', 'Cách thực hiện chi tiết', 'Detailed steps', '詳細な手順'],
    ['>Mẹo hay từ Lotte Mart</', 'event', 'tips', 'Mẹo hay từ Lotte Mart', 'Tips from Lotte Mart', 'ロッテマートからのヒント'],
    ['>Không tìm thấy sự kiện</', 'event', 'notFound', 'Không tìm thấy sự kiện', 'Event not found', 'イベントが見つかりません'],
    ['>Bài viết không tồn tại hoặc đã bị gỡ.</', 'event', 'notExist', 'Bài viết không tồn tại hoặc đã bị gỡ.', 'Article does not exist or has been removed.', '記事が存在しないか、削除されました。'],
    ['>Quay lại danh sách sự kiện</', 'event', 'backToList', 'Quay lại danh sách sự kiện', 'Back to event list', 'イベントリストに戻る'],
    ['>Trang chủ</', 'common', 'home', 'Trang chủ', 'Home', 'ホーム'],
    ['>Sự kiện nổi bật</', 'event', 'featured', 'Sự kiện nổi bật', 'Featured Events', '注目のイベント'],
    ['>Nổi bật</', 'event', 'isFeatured', 'Nổi bật', 'Featured', '注目'],
    ['>Đọc bài</', 'event', 'readArticle', 'Đọc bài', 'Read article', '記事を読む'],
    ['>Chia sẻ</', 'common', 'share', 'Chia sẻ', 'Share', '共有'],
    ['>Chưa có bình luận nào. Hãy là người đầu tiên!</', 'event', 'noComments', 'Chưa có bình luận nào. Hãy là người đầu tiên!', 'No comments yet. Be the first!', 'まだコメントはありません。最初の一人になりましょう！'],
    ['>Có thể bạn quan tâm</', 'event', 'youMayLike', 'Có thể bạn quan tâm', 'You may also like', 'あなたも好きかもしれません'],
    ['>Xem thêm </', 'common', 'viewMore', 'Xem thêm', 'View more', 'もっと見る'],
  ],
  'ErrorPage.tsx': [
    ['>Trang này không tồn tại hoặc đã bị gỡ bỏ.</', 'error', 'pageNotFound', 'Trang này không tồn tại hoặc đã bị gỡ bỏ.', 'This page does not exist or has been removed.', 'このページは存在しないか、削除されました。'],
    ['>Về trang chủ</', 'common', 'backToHome', 'Về trang chủ', 'Back to Home', 'ホームに戻る'],
  ],
  'PromotionDetail.tsx': [
    ['>Đang tải chi tiết khuyến mãi...</', 'promotion', 'loadingDetail', 'Đang tải chi tiết khuyến mãi...', 'Loading promotion details...', 'プロモーションの詳細を読み込み中...'],
    ['>Không tìm thấy chương trình khuyến mãi</', 'promotion', 'notFound', 'Không tìm thấy chương trình khuyến mãi', 'Promotion not found', 'プロモーションが見つかりません'],
    ['>Quay lại trang khuyến mãi</', 'promotion', 'backToPromo', 'Quay lại trang khuyến mãi', 'Back to Promotions', 'プロモーションに戻る'],
    ['>← Quay lại danh sách khuyến mãi</', 'promotion', 'backToList', '← Quay lại danh sách khuyến mãi', '← Back to promotion list', '← プロモーションリストに戻る'],
    ['>Hết lượt</', 'promotion', 'outOfStock', 'Hết lượt', 'Out of uses', '利用回数切れ'],
    ['>Đã hết hạn</', 'promotion', 'expired', 'Đã hết hạn', 'Expired', '期限切れ'],
    ['>Thời gian</', 'common', 'time', 'Thời gian', 'Time', '時間'],
    ['>Điều kiện đơn hàng</', 'promotion', 'orderCondition', 'Điều kiện đơn hàng', 'Order Condition', '注文条件'],
    ['>Số lượng chiến dịch</', 'promotion', 'campaignQuantity', 'Số lượng chiến dịch', 'Campaign Quantity', 'キャンペーン数量'],
  ],
};

function updateDict(lang, dictPath) {
  const data = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
  for (const [file, items] of Object.entries(mappings)) {
    for (const [search, ns, key, viStr, enStr, jaStr] of items) {
      if (!data[ns]) data[ns] = {};
      const val = lang === 'vi' ? viStr : lang === 'en' ? enStr : jaStr;
      data[ns][key] = val;
    }
  }
  fs.writeFileSync(dictPath, JSON.stringify(data, null, 2));
}

updateDict('vi', viDictPath);
updateDict('en', enDictPath);
updateDict('ja', jaDictPath);
console.log('Dictionaries updated successfully');

for (const [file, items] of Object.entries(mappings)) {
  const filePath = path.join(DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log('Not found:', file);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  let changed = false;
  items.forEach(([search, ns, key]) => {
    const replaceWith = `>{t('${ns}.${key}')}</`;
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (content.match(regex)) {
      content = content.replace(regex, replaceWith);
      changed = true;
    }
  });

  const textMatches = [
    { regex: />\s*Nổi bật\s*</g, rep: `>{t('event.isFeatured')}<` },
    { regex: />\s*Đọc bài\s*</g, rep: `>{t('event.readArticle')}<` },
    { regex: />\s*Chia sẻ\s*</g, rep: `>{t('common.share')}<` },
    { regex: />\s*Xem thêm \s*</g, rep: `>{t('common.viewMore')} <` },
    { regex: />\s*Về trang chủ\s*</g, rep: `>{t('common.backToHome')}<` },
    { regex: />\s*Quay lại danh sách sự kiện\s*</g, rep: `>{t('event.backToList')}<` },
    { regex: />\s*Quay lại trang khuyến mãi\s*</g, rep: `>{t('promotion.backToPromo')}<` },
  ];

  textMatches.forEach(({ regex, rep }) => {
    if (content.match(regex)) {
      content = content.replace(regex, rep);
      changed = true;
    }
  });

  if (changed) {
    if (!content.includes('useTranslation')) {
      content = content.replace(/(import React[^;]*;)/, '\$1\nimport { useTranslation } from \'react-i18next\';');
    }
    if (!content.includes('const { t } = useTranslation();')) {
      const fcRegex = /const [a-zA-Z0-9_]+(: React\.FC[^=]*)* = \([^)]*\) => {/;
      content = content.replace(fcRegex, match => match + '\n  const { t } = useTranslation();');
    }
    fs.writeFileSync(filePath, content);
    console.log('Updated', file);
  } else {
    console.log('No matches found for', file);
  }
}
