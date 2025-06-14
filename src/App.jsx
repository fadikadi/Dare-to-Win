import React, { useState, useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n/i18n';
import LanguageToggle from './components/LanguageToggle';
import GameScreen from './components/GameScreen';
import FileUpload from './components/FileUpload';
import MilestoneUpload from './components/MilestoneUpload';
import DownloadSamples from './components/DownloadSamples';
import FileReplacer from './components/FileReplacer';
import defaultQuestionsData from './data/questions.json';
import defaultMilestoneData from './data/milestone.json';
import './App.css';
import SoundManager from './utils/SoundManager';

function AppContent() {
  const [language, setLanguage] = useState('en');
  const [gameState, setGameState] = useState('menu');
  const [showAdditionalContent, setShowAdditionalContent] = useState(false); // New state for toggling content visibility
  // Add timing configurations
  const [processingDelay, setProcessingDelay] = useState(5000); // 5 seconds default
  const [resultDelay, setResultDelay] = useState(5000); // 5 seconds default
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [questionsData, setQuestionsData] = useState(() => {
    // Check for custom questions in localStorage first
    const savedQuestions = localStorage.getItem('customQuestions');
    if (savedQuestions) {
      try {
        return JSON.parse(savedQuestions);
      } catch (error) {
        console.error('Error parsing saved questions:', error);
      }
    }
    return defaultQuestionsData;
  });
  const [milestoneData, setMilestoneData] = useState(() => {
    // Check for custom milestone in localStorage first
    const savedMilestone = localStorage.getItem('customMilestone');
    if (savedMilestone) {
      try {
        return JSON.parse(savedMilestone);
      } catch (error) {
        console.error('Error parsing saved milestone:', error);
      }
    }
    return defaultMilestoneData;
  });
  const [lifelines, setLifelines] = useState({
    fiftyFifty: false,
    askAudience: false,
    phoneFriend: false
  });
  const [finalPrize, setFinalPrize] = useState(0);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [audienceResults, setAudienceResults] = useState(null);
  const [friendSuggestion, setFriendSuggestion] = useState(null);
  
  // Answer confirmation states
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  
  const { t, i18n: i18next } = useTranslation();

  useEffect(() => {
    i18next.changeLanguage(language);
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language, i18next]);

  const handleQuestionsLoaded = (newQuestionsData) => {
    setQuestionsData(newQuestionsData);
  };

  const handleMilestoneLoaded = (newMilestoneData) => {
    setMilestoneData(newMilestoneData);
  };

  const startGame = () => {
    // Use dynamic milestone data from loaded file
    const prizeAmounts = milestoneData.prizeAmounts;
    
    const gameQuestions = [];
    
    // Get questions by difficulty from the current structure
    let easyQuestions, mediumQuestions, hardQuestions;
    
    if (questionsData.questions) {
      // New structure with questions array
      easyQuestions = questionsData.questions.filter(q => q.difficulty === 'easy');
      mediumQuestions = questionsData.questions.filter(q => q.difficulty === 'medium');
      hardQuestions = questionsData.questions.filter(q => q.difficulty === 'hard');
      console.log('Using new structure - Easy:', easyQuestions.length, 'Medium:', mediumQuestions.length, 'Hard:', hardQuestions.length);
    } else {
      // Old structure with direct easy/medium/hard arrays
      easyQuestions = questionsData.easy || [];
      mediumQuestions = questionsData.medium || [];
      hardQuestions = questionsData.hard || [];
      console.log('Using old structure - Easy:', easyQuestions.length, 'Medium:', mediumQuestions.length, 'Hard:', hardQuestions.length);
    }
    
    // Helper function to transform question format
    const transformQuestion = (q, prize) => {
      if (q.question && typeof q.question === 'object') {
        // New structure with bilingual questions - keep the bilingual structure
        return {
          question: q.question, // Keep the {en, ar} structure
          options: q.options, // Keep the options array with {en, ar} structure
          correctIndex: q.correctIndex,
          prize: prize
        };
      } else {
        // Old structure - convert to bilingual format
        return {
          question: {
            en: q.question,
            ar: q.question // For old structure, use same text for both languages
          },
          options: q.answers.map(answer => ({
            en: answer,
            ar: answer // For old structure, use same text for both languages
          })),
          correctIndex: q.correctAnswer || q.correctIndex,
          prize: prize
        };
      }
    };
    
    // Questions 1-5: Easy (first milestone at $1,000)
    const shuffledEasy = [...easyQuestions].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 5; i++) {
      if (shuffledEasy[i]) {
        gameQuestions.push(transformQuestion(shuffledEasy[i], prizeAmounts[i]));
      }
    }
    
    // Questions 6-10: Medium (second milestone at $32,000)
    const shuffledMedium = [...mediumQuestions].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 5; i++) {
      if (shuffledMedium[i]) {
        gameQuestions.push(transformQuestion(shuffledMedium[i], prizeAmounts[i + 5]));
      }
    }
    
    // Questions 11-15: Hard (final section to $1,000,000)
    const shuffledHard = [...hardQuestions].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 5; i++) {
      if (shuffledHard[i]) {
        gameQuestions.push(transformQuestion(shuffledHard[i], prizeAmounts[i + 10]));
      }
    }
    
    setShuffledQuestions(gameQuestions);
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setLifelines({
      fiftyFifty: false,
      askAudience: false,
      phoneFriend: false
    });
    setFinalPrize(0);
    setHiddenOptions([]);
    setAudienceResults(null);
    setFriendSuggestion(null);
    // Reset confirmation states
    setSelectedAnswer(null);
    setShowCorrectAnswer(false);
    setIsProcessingAnswer(false);
  };

  const handleAnswer = (selectedIndex) => {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    // Set selected answer and start processing
    setSelectedAnswer(selectedIndex);
    setIsProcessingAnswer(true);
    
    // Use the configurable processing delay
    setTimeout(() => {
      setShowCorrectAnswer(true);
      setIsProcessingAnswer(false);
      
      // Play sound after answer is revealed
      const isCorrect = selectedIndex === currentQuestion.correctIndex;
      if (isCorrect) {
        SoundManager.playSuccess();
      } else {
        SoundManager.playIncorrect();
      }
      
      // Use the configurable result delay for showing correct/incorrect answer
      setTimeout(() => {
        if (isCorrect) {
          setFinalPrize(currentQuestion.prize);
          if (currentQuestionIndex === shuffledQuestions.length - 1) {
            // Won the game!
            setGameState('ended');
          } else {
            // Next question - reset states and move to next question
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            resetQuestionStates();
          }
        } else {
          // Game over - determine guaranteed prize using dynamic milestones
          let guaranteedPrize = 0;
          const milestones = milestoneData.milestones || [4, 9, 14];
          
          if (currentQuestionIndex > milestones[1]) {
            guaranteedPrize = milestoneData.prizeAmounts[milestones[1]]; // After second milestone
          } else if (currentQuestionIndex > milestones[0]) {
            guaranteedPrize = milestoneData.prizeAmounts[milestones[0]]; // After first milestone
          }
          
          setFinalPrize(guaranteedPrize);
          setGameState('ended');
        }
      }, resultDelay);
    }, processingDelay);
  };

  const resetQuestionStates = () => {
    setSelectedAnswer(null);
    setShowCorrectAnswer(false);
    setIsProcessingAnswer(false);
    setHiddenOptions([]); // Reset 50:50 visual effect for new question
    setAudienceResults(null); // Reset audience results display
    setFriendSuggestion(null); // Reset friend suggestion display
    // Note: lifelines state remains unchanged - once used, they stay disabled
  };

  const handleUseLifeline = (lifelineType) => {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    
    // Map lifeline types to state keys properly
    let stateKey;
    if (lifelineType === 'fifty-fifty') {
      stateKey = 'fiftyFifty';
    } else if (lifelineType === 'ask-audience') {
      stateKey = 'askAudience';
    } else if (lifelineType === 'phone-friend') {
      stateKey = 'phoneFriend';
    }
    
    // Disable the lifeline permanently
    setLifelines(prev => ({
      ...prev,
      [stateKey]: true
    }));
    
    if (lifelineType === 'fifty-fifty') {
      // Remove 2 wrong answers, keep the correct one and one random wrong one
      const correctIndex = currentQuestion.correctIndex;
      const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIndex);
      
      // Randomly select one wrong answer to keep
      const keepWrongIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
      const toHide = wrongIndices.filter(i => i !== keepWrongIndex);
      
      setHiddenOptions(toHide);
      
    } else if (lifelineType === 'ask-audience') {
      // Generate audience poll results with correct answer having higher percentage
      const results = [0, 0, 0, 0];
      const correctIndex = currentQuestion.correctIndex;
      
      // Give correct answer 45-65% chance
      results[correctIndex] = 45 + Math.random() * 20;
      
      // Distribute remaining percentage among other options
      const remaining = 100 - results[correctIndex];
      for (let i = 0; i < 4; i++) {
        if (i !== correctIndex) {
          results[i] = Math.random() * remaining / 3;
        }
      }
      
      // Normalize to 100%
      const total = results.reduce((sum, val) => sum + val, 0);
      for (let i = 0; i < 4; i++) {
        results[i] = Math.round((results[i] / total) * 100);
      }
      
      setAudienceResults(results);
      
    } else if (lifelineType === 'phone-friend') {
      // Friend gives a suggestion (80% chance of correct answer)
      const correctIndex = currentQuestion.correctIndex;
      const isCorrectSuggestion = Math.random() < 0.8;
      
      const suggestedIndex = isCorrectSuggestion 
        ? correctIndex 
        : Math.floor(Math.random() * 4);
      
      const confidence = isCorrectSuggestion 
        ? 70 + Math.random() * 25  // 70-95% confidence if correct
        : 40 + Math.random() * 30; // 40-70% confidence if wrong
      
      setFriendSuggestion({
        optionIndex: suggestedIndex,
        confidence: Math.round(confidence)
      });
    }
  };

  const playAgain = () => {
    setGameState('menu');
    setCurrentQuestionIndex(0);
    setFinalPrize(0);
    setHiddenOptions([]);
    setAudienceResults(null);
    setFriendSuggestion(null);
    // Reset confirmation states
    setSelectedAnswer(null);
    setShowCorrectAnswer(false);
    setIsProcessingAnswer(false);
  };

  const restartGame = () => {
    // Restart with new category-based questions using dynamic milestone data
    const prizeAmounts = milestoneData.prizeAmounts;
    
    const gameQuestions = [];
    
    // Get questions by difficulty from the current structure
    let easyQuestions, mediumQuestions, hardQuestions;
    
    if (questionsData.questions) {
      // New structure with questions array
      easyQuestions = questionsData.questions.filter(q => q.difficulty === 'easy');
      mediumQuestions = questionsData.questions.filter(q => q.difficulty === 'medium');
      hardQuestions = questionsData.questions.filter(q => q.difficulty === 'hard');
    } else {
      // Old structure with direct easy/medium/hard arrays
      easyQuestions = questionsData.easy || [];
      mediumQuestions = questionsData.medium || [];
      hardQuestions = questionsData.hard || [];
    }
    
    // Helper function to transform question format
    const transformQuestion = (q, prize) => {
      if (q.question && typeof q.question === 'object') {
        // New structure with bilingual questions - keep the bilingual structure
        return {
          question: q.question, // Keep the {en, ar} structure
          options: q.options, // Keep the options array with {en, ar} structure
          correctIndex: q.correctIndex,
          prize: prize
        };
      } else {
        // Old structure - convert to bilingual format
        return {
          question: {
            en: q.question,
            ar: q.question // For old structure, use same text for both languages
          },
          options: q.answers.map(answer => ({
            en: answer,
            ar: answer // For old structure, use same text for both languages
          })),
          correctIndex: q.correctAnswer || q.correctIndex,
          prize: prize
        };
      }
    };
    
    // Questions 1-5: Easy (first milestone at $1,000)
    const shuffledEasy = [...easyQuestions].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 5; i++) {
      if (shuffledEasy[i]) {
        gameQuestions.push(transformQuestion(shuffledEasy[i], prizeAmounts[i]));
      }
    }
    
    // Questions 6-10: Medium (second milestone at $32,000)
    const shuffledMedium = [...mediumQuestions].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 5; i++) {
      if (shuffledMedium[i]) {
        gameQuestions.push(transformQuestion(shuffledMedium[i], prizeAmounts[i + 5]));
      }
    }
    
    // Questions 11-15: Hard (final section to $1,000,000)
    const shuffledHard = [...hardQuestions].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 5; i++) {
      if (shuffledHard[i]) {
        gameQuestions.push(transformQuestion(shuffledHard[i], prizeAmounts[i + 10]));
      }
    }
    
    setShuffledQuestions(gameQuestions);
    setCurrentQuestionIndex(0);
    setLifelines({
      fiftyFifty: false,
      askAudience: false,
      phoneFriend: false
    });
    setFinalPrize(0);
    setHiddenOptions([]);
    setAudienceResults(null);
    setFriendSuggestion(null);
    // Reset confirmation states
    setSelectedAnswer(null);
    setShowCorrectAnswer(false);
    setIsProcessingAnswer(false);
    // Keep gameState as 'playing'
  };

  const endGame = () => {
    // End game and go to game over screen with current guaranteed prize using dynamic milestones
    let guaranteedPrize = 0;
    const milestones = milestoneData.milestones || [4, 9, 14];
    
    if (currentQuestionIndex > milestones[1]) {
      guaranteedPrize = milestoneData.prizeAmounts[milestones[1]]; // After second milestone
    } else if (currentQuestionIndex > milestones[0]) {
      guaranteedPrize = milestoneData.prizeAmounts[milestones[0]]; // After first milestone
    }
    
    setFinalPrize(guaranteedPrize);
    setGameState('ended');
  };

  return (
    <div className="App game-container">
      {gameState === 'menu' && (
        <div className="game-header">
          <div className="game-title">
            {t('game_title')} | تجرأ واربح مع الشيخ رياض
          </div>
          <LanguageToggle language={language} setLanguage={setLanguage} />
        </div>
      )}        {gameState === 'menu' && (
        <div className="end-screen">
          <h1>
            {t('game_title')}
          </h1>
          <h2 style={{ color: 'var(--secondary-gold)', fontSize: '1.8rem', marginBottom: '2rem' }}>
            {language === 'ar' ? t('game_title') : 'تجرأ واربح مع الشيخ رياض'}
          </h2>
          
          {showAdditionalContent && (
            <>
              <FileUpload 
                onQuestionsLoaded={handleQuestionsLoaded}
                currentQuestionsCount={
                  questionsData.questions 
                    ? questionsData.questions.length 
                    : (questionsData.easy?.length || 0) + (questionsData.medium?.length || 0) + (questionsData.hard?.length || 0)
                }
              />
              
              <MilestoneUpload 
                onMilestoneLoaded={handleMilestoneLoaded}
                currentMilestone={milestoneData}
              />
              
              <DownloadSamples />
              
              <FileReplacer />
            </>
          )}
          
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button onClick={startGame}>
              {t('start_game')}
            </button>
            
            <button onClick={() => setShowAdditionalContent(!showAdditionalContent)}>
              {showAdditionalContent ? t('hide_settings') || 'Hide Settings' : t('show_settings') || 'Show Settings'}
            </button>
          </div>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'ended') && (
        <GameScreen
          questions={shuffledQuestions}
          currentQuestionIndex={currentQuestionIndex}
          lifelines={lifelines}
          onAnswer={handleAnswer}
          onUseLifeline={handleUseLifeline}
          gameState={gameState}
          finalPrize={finalPrize}
          onPlayAgain={playAgain}
          onRestartGame={restartGame}
          onEndGame={endGame}
          hiddenOptions={hiddenOptions}
          audienceResults={audienceResults}
          friendSuggestion={friendSuggestion}
          milestoneData={milestoneData}
          selectedAnswer={selectedAnswer}
          showCorrectAnswer={showCorrectAnswer}
          isProcessingAnswer={isProcessingAnswer}
          processingDelay={processingDelay}
          resultDelay={resultDelay}
          onProcessingDelayChange={setProcessingDelay}
          onResultDelayChange={setResultDelay}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AppContent />
    </I18nextProvider>
  );
}
