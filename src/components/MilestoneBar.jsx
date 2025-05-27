import React from 'react';
import { useTranslation } from 'react-i18next';

export default function MilestoneBar({ currentQuestionIndex, milestoneData }) {
  const { t } = useTranslation();

  const formatMoney = (amount) => {
    return new Intl.NumberFormat().format(amount);
  };

  // Use dynamic milestone data or fallback to defaults
  const prizeAmounts = milestoneData?.prizeAmounts || [
    100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000,
    64000, 125000, 250000, 500000, 1000000
  ];
  
  const milestones = milestoneData?.milestones || [4, 9, 14];

  return (
    <div className="prize-ladder">
      <h3>{t('milestone')}</h3>
      
      {prizeAmounts.slice().reverse().map((amount, index) => {
        const questionNumber = 15 - index;
        const questionIndex = questionNumber - 1; // Convert to 0-based index
        const isCurrentQuestion = questionNumber === currentQuestionIndex + 1;
        const isPassed = questionNumber < currentQuestionIndex + 1;
        const isGuaranteed = milestones.includes(questionIndex);
        
        let className = 'prize-item';
        if (isCurrentQuestion) className += ' current';
        else if (isPassed) className += ' passed';
        if (isGuaranteed) className += ' milestone';
        
        return (
          <div key={questionNumber} className={className}>
            <span>{questionNumber}.</span>
            <span>${formatMoney(amount)}</span>
            {isGuaranteed && (
              <span style={{ fontSize: '0.7rem', color: '#ffa500' }}>
                ({t('guaranteed')})
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
