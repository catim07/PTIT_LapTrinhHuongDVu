import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'vi', label: t('common.langVietnamese'), flag: '🇻🇳', short: 'VI' },
    { code: 'en', label: t('common.langEnglish'), flag: '🇺🇸', short: 'EN' },
    { code: 'ja', label: t('common.langJapanese'), flag: '🇯🇵', short: 'JA' },
  ];

  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (code: string) => {
    const prevLang = i18n.language;
    i18n.changeLanguage(code);
    localStorage.setItem('lotte_language', code);
    setOpen(false);

    // If language actually changed, force refetch all API data
    // by dispatching a custom event and doing a soft reload of state.
    if (prevLang !== code) {
      // Dispatch custom event so any component can listen and refetch
      window.dispatchEvent(new CustomEvent('lotte_language_changed', { detail: { lang: code, prev: prevLang } }));
      
      // Force page reload to ensure all API data is refetched with new locale
      // This is the most reliable way to ensure stale cached data is cleared
      window.location.reload();
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 200 }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={t('common.changeLanguage')}
        id="language-switcher-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'white',
          padding: '4px 10px',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 700,
          transition: 'all 0.2s',
          backdropFilter: 'blur(4px)',
        }}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.22)'; }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
      >
        <span style={{ fontSize: 16 }}>{current.flag}</span>
        <span>{current.short}</span>
        <span style={{ fontSize: 10, opacity: 0.7, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            border: '1px solid rgba(0,0,0,0.06)',
            minWidth: 160,
            overflow: 'hidden',
            animation: 'fadeInDown 0.2s ease',
          }}
        >
          {languages.map((lang) => {
            const isActive = lang.code === i18n.language;
            return (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                id={`language-option-${lang.code}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: isActive ? '#FFF5F5' : 'white',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 800 : 500,
                  color: isActive ? '#C1121F' : '#333',
                  transition: 'all 0.15s',
                  borderLeft: isActive ? '3px solid #C1121F' : '3px solid transparent',
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#f9f9f9'; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'white'; }}
              >
                <span style={{ fontSize: 20 }}>{lang.flag}</span>
                <span>{lang.label}</span>
                {isActive && <span style={{ marginLeft: 'auto', fontSize: 14 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
