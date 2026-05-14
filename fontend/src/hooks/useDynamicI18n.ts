import { useTranslation } from 'react-i18next';

/**
 * Custom hook to handle Dynamic Content Translations (Mock Data / Database Content).
 * 
 * Logic:
 * If current language is English ('en'), it attempts to read `field_en` first.
 * If current language is Japanese ('ja'), it attempts to read `field_ja` first.
 * If the localized field is missing or language is 'vi', it falls back to the original `field`.
 */
export const useDynamicI18n = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language; // 'vi' | 'en' | 'ja'

  const tDynamic = (item: any, field: string) => {
    if (!item) return '';

    // If English, look for `{field}_en`
    if (currentLang === 'en') {
      const fieldEn = `${field}_en`;
      if (item[fieldEn] && item[fieldEn].trim() !== '') {
        return item[fieldEn];
      }
    }

    // If Japanese, look for `{field}_ja`
    if (currentLang === 'ja') {
      const fieldJa = `${field}_ja`;
      if (item[fieldJa] && item[fieldJa].trim() !== '') {
        return item[fieldJa];
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
