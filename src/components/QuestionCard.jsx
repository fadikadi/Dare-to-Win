import React from 'react';
import { useTranslation } from 'react-i18next';

export default function QuestionCard({ 
  question, 
  onAnswer, 
  currentQuestionIndex, 
  hiddenOptions,
  audienceResults,
  friendSuggestion,
  selectedAnswer,
  showCorrectAnswer,
  isProcessingAnswer
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const formatMoney = (amount) => {
    return new Intl.NumberFormat().format(amount);
  };
  const handleOptionClick = (index) => {
    if (hiddenOptions.includes(index) || isProcessingAnswer || selectedAnswer !== null) {
      return;
    }
    
    onAnswer(index);
  };

  const getOptionClassName = (index) => {
    let className = 'answer-option';
    
    if (hiddenOptions.includes(index)) {
      className += ' hidden';
    }
    
    if (selectedAnswer === index) {
      className += ' selected';
    }
    
    if (showCorrectAnswer && index === question.correctIndex) {
      className += ' correct';
    }
    
    if (showCorrectAnswer && selectedAnswer === index && index !== question.correctIndex) {
      className += ' incorrect';
    }
    
    return className;
  };

  return (
    <div className="game-left-column">
      <div className="question-section">        <div className="question-number">
          {t('question')} {currentQuestionIndex + 1} - ${formatMoney(question.prize || 0)}
        </div>
        
        <div className="question-text">
          {question.question[currentLang === 'ar' ? 'ar' : 'en']}
        </div>        <div className="answer-options">
          {question.options.map((option, index) => {
            const isHidden = hiddenOptions.includes(index);
            
            return (
              <button
                key={index}
                className={getOptionClassName(index)}
                onClick={() => handleOptionClick(index)}
                disabled={isHidden || isProcessingAnswer || selectedAnswer !== null}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">
                  {isHidden ? '---' : option[currentLang === 'ar' ? 'ar' : 'en']}
                </span>
              </button>
            );
          })}        </div>
      </div>

      {/* Processing Message */}
      {isProcessingAnswer && (
        <div className="processing-message">
          <h3>{t('processing') || 'Processing your answer...'}</h3>
        </div>
      )}      {/* Show result after processing */}
      {showCorrectAnswer && !isProcessingAnswer && (
        <div className={`result-message ${selectedAnswer === question.correctIndex ? 'correct' : 'incorrect'}`}>
          <h3>
            {selectedAnswer === question.correctIndex ? 
              (t('correct') || 'Correct! 🎉') : 
              (t('incorrect') || 'Incorrect! 😔')
            }
          </h3>
        </div>
      )}

      {/* Audience Results */}
      {audienceResults && (
        <div className="audience-poll">
          <h3>{t('ask_audience')} - {t('results')}:</h3>
          <div className="poll-bars">
            {audienceResults.map((percentage, index) => (
              <div key={index} className="poll-bar">
                <div 
                  className="bar" 
                  style={{ height: `${Math.max(percentage * 1.5, 5)}px` }}
                ></div>
                <div style={{ color: 'var(--primary-gold)', fontWeight: 'bold' }}>
                  {String.fromCharCode(65 + index)}
                </div>
                <div style={{ color: 'var(--text-white)', fontSize: '0.9em' }}>
                  {percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friend Suggestion */}
      {friendSuggestion && (
        <div className="phone-friend">
          <h3>{t('phone_friend')}:</h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-white)' }}>
            "I think the answer is <strong style={{ color: 'var(--primary-gold)' }}>
              {String.fromCharCode(65 + friendSuggestion.optionIndex)}
            </strong>. I'm about <strong style={{ color: 'var(--primary-gold)' }}>
              {friendSuggestion.confidence}%
            </strong> confident."
          </p>
        </div>
      )}
    </div>
  );
}
