import React, { useState, useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n/i18n';
import LanguageToggle from './components/LanguageToggle';
import SoundToggle from './components/SoundToggle';
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
  
  // Initialize sound manager as early as possible
  React.useEffect(() => {
    SoundManager.init();
  }, []);
  
  const [language, setLanguage] = useState('en');
  const [gameState, setGameState] = useState('menu');
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);
  const [showAdditionalContent, setShowAdditionalContent] = useState(false); // New state for toggling content visibility
  // Milestone display state
  const [showMilestoneDisplay, setShowMilestoneDisplay] = useState(false);
  const [milestoneReached, setMilestoneReached] = useState(null);
  // Answer confirmation states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState(null);
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
  
  // Track used questions to avoid repetition
  const [usedQuestions, setUsedQuestions] = useState({
    easy: new Set(),
    medium: new Set(),
    hard: new Set()
  });
  
  // Answer confirmation states
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  
  
  const { t, i18n: i18next } = useTranslation();

  useEffect(() => {
    
    i18next.changeLanguage(language);
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language, i18next]);

  // Play start sound when the app first loads - simplified approach
  useEffect(() => {
    if (gameState === 'menu') {
      let hasPlayed = false;
      
      const playStartSound = () => {
        if (!hasPlayed) {
          SoundManager.playStart().then(() => {
            console.log('Start sound played successfully');
            hasPlayed = true;
            setSoundPlayed(true);
            cleanup();
          }).catch(() => {
            console.log('Start sound failed, will try on user interaction');
          });
        }
      };
      
      const cleanup = () => {
        document.removeEventListener('click', playStartSound);
        document.removeEventListener('touchstart', playStartSound);
        document.removeEventListener('keydown', playStartSound);
        document.removeEventListener('mouseover', playStartSound);
        document.removeEventListener('mouseenter', playStartSound);
      };
      
      // Try to play immediately
      playStartSound();
      
      // If immediate play fails, set up listeners for first user interaction
      if (!hasPlayed) {
        document.addEventListener('click', playStartSound, { passive: true });
        document.addEventListener('touchstart', playStartSound, { passive: true });
        document.addEventListener('keydown', playStartSound, { passive: true });
        document.addEventListener('mouseover', playStartSound, { passive: true });
        document.addEventListener('mouseenter', playStartSound, { passive: true });
      }
      
      return cleanup;
    }
  }, []); // Only run once when component mounts

  // Play question start sound when a new question appears
  useEffect(() => {
    if (gameState === 'playing') {
      // Add a small delay to let the UI update first
      const timer = setTimeout(() => {
        SoundManager.playQuestionStart();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, gameState]);

  const handleQuestionsLoaded = (newQuestionsData) => {
    setQuestionsData(newQuestionsData);
  };

  const handleMilestoneLoaded = (newMilestoneData) => {
    setMilestoneData(newMilestoneData);
  };

  // Fisher-Yates shuffle algorithm for proper randomization
  const shuffleArray = (array) => {
    const shuffled = [...array];
    // Add extra entropy by shuffling multiple times for critical selections
    for (let shuffleRound = 0; shuffleRound < 2; shuffleRound++) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }
    return shuffled;
  };

  // Shuffle answer options while keeping track of correct answer
  const shuffleQuestionOptions = (question) => {
    const correctAnswer = question.options[question.correctIndex];
    const shuffledOptions = shuffleArray(question.options);
    const newCorrectIndex = shuffledOptions.findIndex(option => option === correctAnswer);
    
    return {
      ...question,
      options: shuffledOptions,
      correctIndex: newCorrectIndex
    };
  };

  // Select questions avoiding previously used ones
  const selectQuestionsFromPool = (questionPool, difficulty, count, usedIds) => {
    console.log(`Selecting ${count} ${difficulty} questions from pool of ${questionPool.length}`);
    console.log(`Currently used ${difficulty} IDs:`, Array.from(usedIds));
    
    // Filter out already used questions
    const availableQuestions = questionPool.filter(q => !usedIds.has(q.id));
    console.log(`Available unused ${difficulty} questions:`, availableQuestions.length);
    
    // If we don't have enough unused questions, or if we've used more than 50% of available questions, reset
    const resetThreshold = Math.ceil(questionPool.length * 0.5);
    if (availableQuestions.length < count || usedIds.size >= resetThreshold) {
      console.log(`Resetting ${difficulty} questions - used: ${usedIds.size}, threshold: ${resetThreshold}, available: ${availableQuestions.length}`);
      usedIds.clear();
      // Use all questions and shuffle them
      const shuffledPool = shuffleArray([...questionPool]);
      console.log(`Reset complete. Selecting first ${count} from shuffled pool of ${shuffledPool.length}`);
      return shuffledPool.slice(0, count);
    }
    
    // Shuffle available questions and take the required count
    const shuffledAvailable = shuffleArray([...availableQuestions]);
    const selected = shuffledAvailable.slice(0, count);
    console.log(`Selected ${difficulty} questions:`, selected.map(q => `ID:${q.id}`));
    return selected;
  };

  // Generate a new set of game questions with maximum variety
  const generateGameQuestions = () => {
    console.log('=== GENERATING NEW GAME QUESTIONS ===');
    console.log('Current used questions - Easy:', usedQuestions.easy.size, 'Medium:', usedQuestions.medium.size, 'Hard:', usedQuestions.hard.size);
    
    const prizeAmounts = milestoneData.prizeAmounts;
    const gameQuestions = [];
    
    // Create new used questions tracking (will be updated and returned)
    const newUsedQuestions = {
      easy: new Set(usedQuestions.easy),
      medium: new Set(usedQuestions.medium), 
      hard: new Set(usedQuestions.hard)
    };
    
    // Get questions by difficulty from the current structure
    let easyQuestions, mediumQuestions, hardQuestions;
    
    if (questionsData.questions) {
      // New structure with questions array
      easyQuestions = questionsData.questions.filter(q => q.difficulty === 'easy');
      mediumQuestions = questionsData.questions.filter(q => q.difficulty === 'medium');
      hardQuestions = questionsData.questions.filter(q => q.difficulty === 'hard');
      console.log('Available questions - Easy:', easyQuestions.length, 'Medium:', mediumQuestions.length, 'Hard:', hardQuestions.length);
    } else {
      // Old structure with direct easy/medium/hard arrays
      easyQuestions = questionsData.easy || [];
      mediumQuestions = questionsData.medium || [];
      hardQuestions = questionsData.hard || [];
      console.log('Available questions (old format) - Easy:', easyQuestions.length, 'Medium:', mediumQuestions.length, 'Hard:', hardQuestions.length);
    }

    // Helper function to transform question format
    const transformQuestion = (q, prize) => {
      let transformedQuestion;
      
      if (q.question && typeof q.question === 'object') {
        // New structure with bilingual questions - keep the bilingual structure
        transformedQuestion = {
          question: q.question, // Keep the {en, ar} structure
          options: q.options, // Keep the options array with {en, ar} structure
          category: q.category || { en: "", ar: "" }, // Include category with fallback
          correctIndex: q.correctIndex,
          prize: prize,
          id: q.id // Keep the question ID for tracking
        };
      } else {
        // Old structure - convert to bilingual format
        transformedQuestion = {
          question: {
            en: q.question,
            ar: q.question // For old structure, use same text for both languages
          },
          options: q.answers.map(answer => ({
            en: answer,
            ar: answer // For old structure, use same text for both languages
          })),
          category: q.category || { en: "", ar: "" }, // Include category with fallback
          correctIndex: q.correctAnswer || q.correctIndex,
          prize: prize,
          id: q.id || `${q.question?.en || q.question}_${Math.random()}` // Generate stable ID if not present
        };
      }
      
      // Shuffle the answer options to make each game unique
      return shuffleQuestionOptions(transformedQuestion);
    };
    
    // Questions 1-5: Easy (first milestone at $1,000)
    console.log('--- Selecting Easy Questions (1-5) ---');
    console.log('Easy questions pool (first 5 IDs):', easyQuestions.slice(0, 5).map(q => q.id));
    const selectedEasy = selectQuestionsFromPool(easyQuestions, 'easy', 5, newUsedQuestions.easy);
    console.log('Selected easy question IDs (before additional shuffle):', selectedEasy.map(q => q.id));
    // Shuffle the selected easy questions again for extra randomization
    const shuffledSelectedEasy = shuffleArray([...selectedEasy]);
    console.log('Shuffled easy question IDs (after additional shuffle):', shuffledSelectedEasy.map(q => q.id));
    console.log('FIRST QUESTION will be ID:', shuffledSelectedEasy[0]?.id, 'Text:', shuffledSelectedEasy[0]?.question?.en || shuffledSelectedEasy[0]?.question);
    shuffledSelectedEasy.forEach((q, i) => {
      const transformed = transformQuestion(q, prizeAmounts[i]);
      gameQuestions.push(transformed);
      newUsedQuestions.easy.add(q.id);
      console.log(`Easy Q${i+1}: ID=${q.id}, Text="${q.question?.en || q.question}"`);
    });
    
    // Questions 6-10: Medium (second milestone at $32,000)
    console.log('--- Selecting Medium Questions (6-10) ---');
    const selectedMedium = selectQuestionsFromPool(mediumQuestions, 'medium', 5, newUsedQuestions.medium);
    // Shuffle the selected medium questions again for extra randomization
    const shuffledSelectedMedium = shuffleArray([...selectedMedium]);
    shuffledSelectedMedium.forEach((q, i) => {
      const transformed = transformQuestion(q, prizeAmounts[i + 5]);
      gameQuestions.push(transformed);
      newUsedQuestions.medium.add(q.id);
      console.log(`Medium Q${i+6}: ID=${q.id}, Text="${q.question?.en || q.question}"`);
    });
    
    // Questions 11-15: Hard (final section to $1,000,000)
    console.log('--- Selecting Hard Questions (11-15) ---');
    const selectedHard = selectQuestionsFromPool(hardQuestions, 'hard', 5, newUsedQuestions.hard);
    // Shuffle the selected hard questions again for extra randomization
    const shuffledSelectedHard = shuffleArray([...selectedHard]);
    shuffledSelectedHard.forEach((q, i) => {
      const transformed = transformQuestion(q, prizeAmounts[i + 10]);
      gameQuestions.push(transformed);
      newUsedQuestions.hard.add(q.id);
      console.log(`Hard Q${i+11}: ID=${q.id}, Text="${q.question?.en || q.question}"`);
    });

    console.log('=== FINAL GAME QUESTIONS ===');
    console.log('Generated game with question IDs:', gameQuestions.map((q, i) => `${i+1}:${q.id}`));
    console.log('Updated used questions count - Easy:', newUsedQuestions.easy.size, 'Medium:', newUsedQuestions.medium.size, 'Hard:', newUsedQuestions.hard.size);
    console.log('First question (should be randomized easy):', gameQuestions[0]?.question?.en || gameQuestions[0]?.question);
    console.log('==============================');
    
    return { gameQuestions, newUsedQuestions };
  };

  // Reset used questions manually (for debugging or fresh start)
  const resetUsedQuestions = () => {
    setUsedQuestions({ easy: new Set(), medium: new Set(), hard: new Set() });
    console.log('Used questions reset - all questions are now available');
    console.log('You can now test fresh randomization');
  };

  // Test function to verify randomization (for development)
  const testRandomization = () => {
    console.log('=== TESTING RANDOMIZATION ===');
    for (let i = 0; i < 3; i++) {
      console.log(`\n--- Test Run ${i + 1} ---`);
      const result = generateGameQuestions();
      console.log(`Run ${i + 1} question IDs:`, result.gameQuestions.map(q => q.id).join(', '));
      console.log(`Run ${i + 1} first question:`, result.gameQuestions[0]?.question?.en || result.gameQuestions[0]?.question);
    }
    console.log('========================');
  };

  const startGame = () => {
    // Play start game sound immediately when button is clicked
    SoundManager.playStart();
    
    // Set loading state
    setIsStartingGame(true);
    
    // Generate new randomized questions
    const result = generateGameQuestions();
    setShuffledQuestions(result.gameQuestions);
    setUsedQuestions(result.newUsedQuestions);
    
    // Wait 5 seconds before starting the game
    setTimeout(() => {
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
      setShowConfirmation(false);
      setPendingAnswer(null);
      // Reset milestone display states
      setShowMilestoneDisplay(false);
      setMilestoneReached(null);
      setIsStartingGame(false); // Clear loading state
    }, 5000); // 5 second delay

    // Remove loading state after a short delay
    setTimeout(() => {
      setIsStartingGame(false);
    }, 1000); // 1 second delay for demo purposes
  };

  const handleAnswer = (selectedIndex) => {
    // Store the selected answer for confirmation
    setPendingAnswer(selectedIndex);
    setSelectedAnswer(selectedIndex);
    setShowConfirmation(true);
    
    // Play confirm answer sound when confirmation screen appears
    SoundManager.playConfirmAnswer();
  };

  const confirmAnswer = () => {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const selectedIndex = pendingAnswer;
    
    // Hide confirmation dialog
    setShowConfirmation(false);
    
    // Play waiting result sound when answer is confirmed
    SoundManager.playWaitingResult();
    
    // Start processing
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
          
          // Check if we reached a milestone
          const milestones = milestoneData.milestones || [4, 9, 14];
          const isMilestone = milestones.includes(currentQuestionIndex);
          
          if (currentQuestionIndex === shuffledQuestions.length - 1) {
            // Won the game!
            setGameState('ended');
          } else if (isMilestone) {
            // Milestone reached - show milestone display for 10 seconds
            setMilestoneReached({
              questionNumber: currentQuestionIndex + 1,
              prize: currentQuestion.prize,
              isGuaranteed: true
            });
            setShowMilestoneDisplay(true);
            
            // Play milestone sound after a small delay to let UI render
            setTimeout(() => {
              SoundManager.playMilestone();
            }, 500);
            
            // After 10 seconds, hide milestone and continue to next question
            setTimeout(() => {
              setShowMilestoneDisplay(false);
              setMilestoneReached(null);
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              resetQuestionStates();
            }, 10000); // 10 seconds
          } else {
            // Regular correct answer - proceed to next question immediately
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

  const cancelAnswer = () => {
    // Play question start sound when user chooses to change answer
    SoundManager.playQuestionStart();
    
    // Reset selection and hide confirmation
    setShowConfirmation(false);
    setSelectedAnswer(null);
    setPendingAnswer(null);
  };

  const resetQuestionStates = () => {
    setSelectedAnswer(null);
    setShowCorrectAnswer(false);
    setIsProcessingAnswer(false);
    setHiddenOptions([]); // Reset 50:50 visual effect for new question
    setAudienceResults(null); // Reset audience results display
    setFriendSuggestion(null); // Reset friend suggestion display
    setShowMilestoneDisplay(false); // Reset milestone display
    setMilestoneReached(null); // Reset milestone data
    setShowConfirmation(false); // Reset confirmation dialog
    setPendingAnswer(null); // Reset pending answer
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
    // Stop all sounds when returning to menu
    SoundManager.stopAll();
    
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
    setShowConfirmation(false);
    setPendingAnswer(null);
    // Reset milestone display states
    setShowMilestoneDisplay(false);
    setMilestoneReached(null);
    // Reset used questions when returning to menu (optional - for fresh start)
    // setUsedQuestions({ easy: new Set(), medium: new Set(), hard: new Set() });
  };

  const restartGame = () => {
    // Stop all sounds when restarting the game
    SoundManager.stopAll();

    // Generate new randomized questions avoiding previous ones
    const result = generateGameQuestions();
    setShuffledQuestions(result.gameQuestions);
    setUsedQuestions(result.newUsedQuestions);
    
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
    setShowConfirmation(false);
    setPendingAnswer(null);
    // Reset milestone display states
    setShowMilestoneDisplay(false);
    setMilestoneReached(null);
    // Keep gameState as 'playing'
  };

  const endGame = () => {
    // Stop all sounds when quitting the game
    SoundManager.stopAll();
    
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
          <div className="game-controls">
            <LanguageToggle language={language} setLanguage={setLanguage} />
            <SoundToggle />
          </div>
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
              
              {/* Debug controls for question randomization */}
              <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1rem' }}>Debug Controls</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={resetUsedQuestions} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Reset Question History
                  </button>
                  <button onClick={testRandomization} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Test Randomization
                  </button>
                </div>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#666' }}>
                  Check browser console for detailed logs
                </p>
              </div>
            </>
          )}
          
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button onClick={startGame} disabled={isStartingGame}>
              {isStartingGame ? t('starting_game') : t('start_game')}
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
          showMilestoneDisplay={showMilestoneDisplay}
          milestoneReached={milestoneReached}
          showConfirmation={showConfirmation}
          pendingAnswer={pendingAnswer}
          onConfirmAnswer={confirmAnswer}
          onCancelAnswer={cancelAnswer}
        />
      )}

      {isStartingGame && (
        <div className="loading-screen">
          <div className="loading-content">
            <h2>{t('starting_game') || 'Starting Game...'}</h2>
            <div className="loading-spinner"></div>
            <p>{t('preparing_questions') || 'Preparing your questions...'}</p>
          </div>
        </div>
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
