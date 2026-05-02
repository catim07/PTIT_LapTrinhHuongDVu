import { useTranslation } from 'react-i18next';

/**
 * Custom hook to handle Dynamic Content Translations (Mock Data / Database Content).
 * 
 * Logic:
 * If current language is English ('en'), it attempts to read `field_en` first.
 * If `field_en` is missing or language is 'vi', it falls back to the original `field`.
 */
export const useDynamicI18n = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language; // 'vi' or 'en'

  const tDynamic = (item: any, field: string) => {
    if (!item) return '';

    // If English, look for `{field}_en`
    if (currentLang === 'en') {
      const fieldEn = `${field}_en`;
      if (item[fieldEn] && item[fieldEn].trim() !== '') {
        return item[fieldEn];
      }
    }

    // Fallback to original field (Vietnamese base)
    return item[field] || '';
  };

  /**
   * Translates an entire array of objects dynamically
   */
  const mapDynamicArray = (array: any[], fieldsToTranslate: string[]) => {
    return array.map(item => {
      const translatedItem = { ...item };
      fieldsToTranslate.forEach(field => {
        translatedItem[field] = tDynamic(item, field);
      });
      return translatedItem;
    });
  };

  return { tDynamic, mapDynamicArray, currentLang };
};
