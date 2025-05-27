// Test script to verify question selection logic
const fs = require('fs');

// Read the questions data
const questionsData = JSON.parse(fs.readFileSync('./src/data/questions.json', 'utf8'));

console.log('Testing category-based question selection...\n');

// Test the question selection logic (same as in App.jsx)
const prizeAmounts = [
  100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000,
  64000, 125000, 250000, 500000, 1000000
];

const gameQuestions = [];

// Questions 1-5: Easy (first milestone at $1,000)
const easyQuestions = [...questionsData.easy].sort(() => Math.random() - 0.5);
for (let i = 0; i < 5; i++) {
  if (easyQuestions[i]) {
    gameQuestions.push({
      ...easyQuestions[i],
      prize: prizeAmounts[i]
    });
  }
}

// Questions 6-10: Medium (second milestone at $32,000)
const mediumQuestions = [...questionsData.medium].sort(() => Math.random() - 0.5);
for (let i = 0; i < 5; i++) {
  if (mediumQuestions[i]) {
    gameQuestions.push({
      ...mediumQuestions[i],
      prize: prizeAmounts[i + 5]
    });
  }
}

// Questions 11-15: Hard (final section to $1,000,000)
const hardQuestions = [...questionsData.hard].sort(() => Math.random() - 0.5);
for (let i = 0; i < 5; i++) {
  if (hardQuestions[i]) {
    gameQuestions.push({
      ...hardQuestions[i],
      prize: prizeAmounts[i + 10]
    });
  }
}

console.log(`Total questions selected: ${gameQuestions.length}`);
console.log('\nQuestion breakdown by difficulty and prize:');

gameQuestions.forEach((q, index) => {
  console.log(`${index + 1}. ${q.difficulty.toUpperCase()} - $${q.prize.toLocaleString()} - ${q.question.en}`);
});

console.log('\nMilestone verification:');
console.log(`Question 5 (First milestone): $${gameQuestions[4]?.prize?.toLocaleString()} - Expected: $1,000`);
console.log(`Question 10 (Second milestone): $${gameQuestions[9]?.prize?.toLocaleString()} - Expected: $32,000`);
console.log(`Question 15 (Final prize): $${gameQuestions[14]?.prize?.toLocaleString()} - Expected: $1,000,000`);

console.log('\nDifficulty progression check:');
const firstFive = gameQuestions.slice(0, 5).every(q => q.difficulty === 'easy');
const secondFive = gameQuestions.slice(5, 10).every(q => q.difficulty === 'medium');
const thirdFive = gameQuestions.slice(10, 15).every(q => q.difficulty === 'hard');

console.log(`Questions 1-5 are easy: ${firstFive}`);
console.log(`Questions 6-10 are medium: ${secondFive}`);
console.log(`Questions 11-15 are hard: ${thirdFive}`);
console.log(`\nAll tests passed: ${firstFive && secondFive && thirdFive && gameQuestions.length === 15}`);
