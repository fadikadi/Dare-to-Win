import React from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n/i18n';
import defaultQuestionsData from './data/questions.json';
import defaultMilestoneData from './data/milestone.json';
import './App.css';

function AppContent() {
  const { t } = useTranslation();
  
  const questionsCount = defaultQuestionsData.questions ? defaultQuestionsData.questions.length : 0;
  
  return (
    <div style={{color: 'white', padding: '20px', minHeight: '100vh', backgroundColor: '#000000'}}>
      <h1>🎮 Millionaire Game</h1>
      <p>Game is loading...</p>
      <p>Translation test: {t('start_game', 'Start Game')}</p>
      <p>Questions loaded: {questionsCount}</p>
      <p>Prize levels: {defaultMilestoneData.prizeAmounts?.length || 0}</p>
    </div>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AppContent />
    </I18nextProvider>
  );
}

export default App;
