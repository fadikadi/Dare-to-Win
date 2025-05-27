import React from 'react';
import { useTranslation } from 'react-i18next';

export default function GameControls({ 
  onRestartGame, 
  onEndGame
}) {
  const { t } = useTranslation();

  return (
    <div className="game-controls">
      <button
        className="lifeline-button restart-button"
        onClick={onRestartGame}
        title={t('restart')}
      >
        {t('restart')}
      </button>
      <button
        className="lifeline-button quit-button"
        onClick={onEndGame}
        title={t('quit')}
      >
        {t('quit')}
      </button>
    </div>
  );
}
