import React from 'react';

export default function LanguageToggle({ language, setLanguage }) {
  return (
    <div style={{ margin: '1rem' }}>
      <button onClick={() => setLanguage('en')} disabled={language === 'en'}>English</button>
      <button onClick={() => setLanguage('ar')} disabled={language === 'ar'} style={{ marginLeft: '0.5rem' }}>العربية</button>
    </div>
  );
}
