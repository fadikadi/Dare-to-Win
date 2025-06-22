import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SoundManager from '../utils/SoundManager';

export default function SoundToggle() {
  const { t } = useTranslation();
  const [soundEnabled, setSoundEnabled] = useState(SoundManager.isEnabled);

  const toggleSound = () => {
    const newState = SoundManager.toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <button 
      className={`sound-toggle ${soundEnabled ? 'enabled' : 'disabled'}`}
      onClick={toggleSound}
      title={soundEnabled ? t('sound_on') : t('sound_off')}
      aria-label={soundEnabled ? t('sound_on') : t('sound_off')}
    >
      {soundEnabled ? '🔊' : '🔇'}
    </button>
  );
}
