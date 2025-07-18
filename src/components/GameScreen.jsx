import React from 'react';
import { useTranslation } from 'react-i18next';
import QuestionCard from './QuestionCard';
import Lifelines from './Lifelines';
import GameControls from './GameControls';
import MilestoneBar from './MilestoneBar';
import SoundManager from '../utils/SoundManager';

export default function GameScreen({ 
  questions, 
  currentQuestionIndex, 
  lifelines, 
  onAnswer, 
  onUseLifeline,
  gameState,
  finalPrize,
  onPlayAgain,
  onRestartGame,
  onEndGame,
  hiddenOptions,
  audienceResults,
  friendSuggestion,
  milestoneData,
  selectedAnswer,
  showCorrectAnswer,
  isProcessingAnswer,
  processingDelay,
  resultDelay,
  onProcessingDelayChange,
  onResultDelayChange,
  showMilestoneDisplay,
  milestoneReached,
  showConfirmation,
  pendingAnswer,
  onConfirmAnswer,
  onCancelAnswer
}) {
  const { t, i18n } = useTranslation();

  const formatMoney = (amount) => {
    return new Intl.NumberFormat().format(amount);
  };
  const handleAnswer = (answer, isCorrect) => {
    // Pass the answer to the main game logic without playing sounds here
    // Sounds will be handled by the main App component
    onAnswer(answer);
  };

  if (gameState === 'ended') {
    return (
      <div className="end-screen">
        <h1>
          {finalPrize > 0 ? t('congratulations') : t('game_over')}
        </h1>
        <div className="final-prize">
          {t('you_won')}: ${formatMoney(finalPrize)}
        </div>
        <div className="timing-controls">
          <div className="timing-control">
            <label htmlFor="processingDelay">{t('processing_time')}</label>            <select 
              id="processingDelay"
              value={processingDelay}
              onChange={(e) => onProcessingDelayChange(Number(e.target.value))}
            >
              <option value="2000">2 {t('seconds')}</option>
              <option value="3000">3 {t('seconds')}</option>
              <option value="4000">4 {t('seconds')}</option>
              <option value="5000">5 {t('seconds')}</option>
              <option value="6000">6 {t('seconds')}</option>
              <option value="7000">7 {t('seconds')}</option>
              <option value="8000">8 {t('seconds')}</option>
              <option value="9000">9 {t('seconds')}</option>
              <option value="10000">10 {t('seconds')}</option>
            </select>
          </div>
          <div className="timing-control">
            <label htmlFor="resultDelay">{t('result_time')}</label>            <select 
              id="resultDelay"
              value={resultDelay}
              onChange={(e) => onResultDelayChange(Number(e.target.value))}
            >
              <option value="2000">2 {t('seconds')}</option>
              <option value="3000">3 {t('seconds')}</option>
              <option value="4000">4 {t('seconds')}</option>
              <option value="5000">5 {t('seconds')}</option>
              <option value="6000">6 {t('seconds')}</option>
              <option value="7000">7 {t('seconds')}</option>
              <option value="8000">8 {t('seconds')}</option>
              <option value="9000">9 {t('seconds')}</option>
              <option value="10000">10 {t('seconds')}</option>
            </select>
          </div>
        </div>
        <button onClick={onPlayAgain}>
          {t('play_again')}
        </button>
      </div>    );  }  // Milestone display screen
  if (showMilestoneDisplay && milestoneReached) {
    return (
      <div className="milestone-display">
        <div className="milestone-content">
          <h1 className="milestone-title">{t('milestone_reached')}</h1>
          <div className="milestone-info">
            <div className="milestone-question">
              {t('question')} {milestoneReached.questionNumber}
            </div>
            <div className="milestone-prize">
              ${formatMoney(milestoneReached.prize)}
            </div>
            <div className="milestone-guaranteed">
              {t('guaranteed_prize')}
            </div>
          </div>
          <div className="milestone-message">
            {t('milestone_message_with_amount', { amount: `$${formatMoney(milestoneReached.prize)}` })}
          </div>
        </div>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  
  // Debug logging and error checking
  if (!questions || questions.length === 0) {
    return (
      <div className="game-screen">
        <div className="error-message">
          <h2>No questions available</h2>
          <p>Please check that questions data is loaded properly.</p>
          <button onClick={onPlayAgain}>Back to Menu</button>
        </div>
      </div>
    );
  }
  
  if (!currentQuestion) {
    return (
      <div className="game-screen">
        <div className="error-message">
          <h2>Question not found</h2>
          <p>Current question index: {currentQuestionIndex}</p>
          <p>Total questions: {questions.length}</p>
          <button onClick={onPlayAgain}>Back to Menu</button>
        </div>
      </div>
    );
  }
  
  return (    <div className="game-screen">
      {/* Main Game Area with Two-Column Layout */}
      <div className="game-main">
        {/* Left Column - Lifelines and Question */}
        <div className="game-left-column">
          {/* Lifelines above the question */}
          <Lifelines 
            lifelines={lifelines}
            onUseLifeline={onUseLifeline}
          />          
          <QuestionCard
            question={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            onAnswer={handleAnswer}
            hiddenOptions={hiddenOptions}
            audienceResults={audienceResults}
            friendSuggestion={friendSuggestion}
            selectedAnswer={selectedAnswer}
            showCorrectAnswer={showCorrectAnswer}
            isProcessingAnswer={isProcessingAnswer}
          />

          {/* Answer Confirmation Section - appears under question */}
          {showConfirmation && pendingAnswer !== null && (
            <div className="question-confirmation">
              <div className="confirmation-content">
                <h3 className="confirmation-title">{t('confirm_answer')}</h3>
                <div className="confirmation-row">
                  <div className="answer-option">
                    <span className="option-letter">
                      {String.fromCharCode(65 + pendingAnswer)}
                    </span>
                    <span className="option-text">
                      {currentQuestion.options[pendingAnswer][i18n.language] || currentQuestion.options[pendingAnswer].en || currentQuestion.options[pendingAnswer]}
                    </span>
                  </div>
                  <div className="confirmation-buttons">
                    <button className="confirm-btn" onClick={onConfirmAnswer}>
                      {t('final_answer')}
                    </button>
                    <button className="cancel-btn" onClick={onCancelAnswer}>
                      {t('change_answer')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Game Controls and Milestone Ladder */}
        <div className="game-right-column">
          {/* Game Controls above the milestone ladder */}          <GameControls 
            onRestartGame={onRestartGame}
            onEndGame={onEndGame}
            processingDelay={processingDelay}
            resultDelay={resultDelay}
            onProcessingDelayChange={onProcessingDelayChange}
            onResultDelayChange={onResultDelayChange}
          />
            <MilestoneBar 
            currentQuestionIndex={currentQuestionIndex}
            milestoneData={milestoneData}
          />
        </div>
      </div>
    </div>
  );
}
