import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', short: 'VN' },
  { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lotte_language', code);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 200 }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change language"
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
