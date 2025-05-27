import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Lifelines({ lifelines, onUseLifeline }) {
  const { t } = useTranslation();
  return (
    <div className="lifelines">
      <div className="lifeline-buttons">
        <button
          className="lifeline-button"
          onClick={() => onUseLifeline('fifty-fifty')}
          disabled={lifelines.fiftyFifty}
        >
          {t('fifty_fifty')}
        </button>
        
        <button
          className="lifeline-button"
          onClick={() => onUseLifeline('ask-audience')}
          disabled={lifelines.askAudience}
        >
          {t('ask_audience')}
        </button>
        
        <button
          className="lifeline-button"
          onClick={() => onUseLifeline('phone-friend')}
          disabled={lifelines.phoneFriend}
        >
          {t('phone_friend')}
        </button>
      </div>
    </div>
  );
}
