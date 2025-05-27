// Simple verification script for the milestone fix
import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying the milestone.json fix...\n');

try {
  // Read the milestone data
  const milestoneData = JSON.parse(fs.readFileSync('src/data/milestone.json', 'utf8'));
  
  console.log('✅ Milestone data loaded successfully');
  console.log(`📊 Prize amounts: ${milestoneData.prizeAmounts.length} values`);
  console.log(`💰 First prize: $${milestoneData.prizeAmounts[0].toLocaleString()}`);
  console.log(`💰 Fifth prize (milestone): $${milestoneData.prizeAmounts[4].toLocaleString()}`);
  console.log(`💰 Tenth prize (milestone): $${milestoneData.prizeAmounts[9].toLocaleString()}`);
  console.log(`💰 Final prize: $${milestoneData.prizeAmounts[14].toLocaleString()}`);
  
  // Verify the structure
  const expectedStructure = {
    hasCorrectLength: milestoneData.prizeAmounts.length === 15,
    hasValidMilestones: Array.isArray(milestoneData.milestones) && milestoneData.milestones.length === 3,
    isAscending: milestoneData.prizeAmounts.every((amount, i) => 
      i === 0 || amount > milestoneData.prizeAmounts[i - 1]),
    hasReasonableAmounts: milestoneData.prizeAmounts[0] >= 100 && milestoneData.prizeAmounts[14] >= 1000000
  };
  
  console.log('\n🔍 Structure verification:');
  console.log(`   Correct length (15): ${expectedStructure.hasCorrectLength ? '✅' : '❌'}`);
  console.log(`   Valid milestones: ${expectedStructure.hasValidMilestones ? '✅' : '❌'}`);
  console.log(`   Ascending order: ${expectedStructure.isAscending ? '✅' : '❌'}`);
  console.log(`   Reasonable amounts: ${expectedStructure.hasReasonableAmounts ? '✅' : '❌'}`);
  
  const allValid = Object.values(expectedStructure).every(Boolean);
  console.log(`\n${allValid ? '🎉' : '⚠️'} Overall status: ${allValid ? 'ALL GOOD!' : 'ISSUES FOUND'}`);
  
  if (allValid) {
    console.log('\n✨ The milestone.json fix is working correctly!');
    console.log('🎮 The game should now display proper "Who Wants to Be a Millionaire" prize amounts.');
  }
  
} catch (error) {
  console.error('❌ Error verifying milestone data:', error.message);
}
