import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function MilestoneUpload({ onMilestoneLoaded, currentMilestone }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const saveMilestoneToProject = async (milestoneData) => {
    try {
      // Create a downloadable file that will replace the default milestone.json
      const jsonString = JSON.stringify(milestoneData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'milestone.json';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Also save to localStorage for persistence
      localStorage.setItem('customMilestone', jsonString);
      
      // Show instructions to user
      setTimeout(() => {
        alert(t('milestone_saved_instructions'));
      }, 1000);
    } catch (error) {
      console.error('Error saving milestone:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if it's a JSON file
    if (!file.name.toLowerCase().endsWith('.json')) {
      alert(t('invalid_file_type'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = JSON.parse(e.target.result);
        
        // Validate the JSON structure
        if (!jsonContent.prizeAmounts || !Array.isArray(jsonContent.prizeAmounts)) {
          alert(t('invalid_milestone_structure'));
          return;
        }

        // Validate prize amounts array has exactly 15 elements
        if (jsonContent.prizeAmounts.length !== 15) {
          alert(t('invalid_prize_count'));
          return;
        }

        // Validate all prize amounts are positive numbers
        const isValidPrizes = jsonContent.prizeAmounts.every(prize => 
          typeof prize === 'number' && prize > 0
        );

        if (!isValidPrizes) {
          alert(t('invalid_prize_values'));
          return;
        }

        // Validate milestones array if provided
        if (jsonContent.milestones) {
          if (!Array.isArray(jsonContent.milestones) || jsonContent.milestones.length !== 3) {
            alert(t('invalid_milestone_indices'));
            return;
          }

          const isValidMilestones = jsonContent.milestones.every(milestone => 
            typeof milestone === 'number' && milestone >= 0 && milestone <= 14
          );

          if (!isValidMilestones) {
            alert(t('invalid_milestone_values'));
            return;
          }
        } else {
          // Set default milestones if not provided
          jsonContent.milestones = [4, 9, 14];
        }        // Success - pass the milestone data to parent component
        onMilestoneLoaded(jsonContent);
        
        // Save to localStorage and download for manual placement
        saveMilestoneToProject(jsonContent);
        
        alert(t('milestone_loaded_successfully', { 
          count: jsonContent.prizeAmounts.length,
          highest: new Intl.NumberFormat().format(Math.max(...jsonContent.prizeAmounts))
        }));

      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert(t('json_parse_error'));
      }
    };

    reader.onerror = () => {
      alert(t('file_read_error'));
    };

    reader.readAsText(file);
    
    // Reset the input so the same file can be uploaded again if needed
    event.target.value = '';
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat().format(amount);
  };

  return (
    <div className="milestone-upload-section">
      <div className="current-milestone-info">
        <p className="milestone-summary">
          {t('current_milestone_range')}: ${formatMoney(currentMilestone.prizeAmounts[0])} - ${formatMoney(currentMilestone.prizeAmounts[14])}
        </p>
        <p className="milestone-guaranteed">
          {t('milestone_guaranteed')}: ${formatMoney(currentMilestone.prizeAmounts[4])}, ${formatMoney(currentMilestone.prizeAmounts[9])}, ${formatMoney(currentMilestone.prizeAmounts[14])}
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      
      <button 
        className="upload-button milestone-upload-button"
        onClick={triggerFileUpload}
      >
        {t('upload_milestone_file')}
      </button>
      
      <div className="upload-help">
        <p className="upload-instructions">
          {t('milestone_upload_instructions')}
        </p>
        <div className="format-requirements">
          <h4>{t('milestone_format_requirements')}:</h4>
          <ul>
            <li>{t('milestone_requirement_json_format')}</li>
            <li>{t('milestone_requirement_15_prizes')}</li>
            <li>{t('milestone_requirement_positive_numbers')}</li>
            <li>{t('milestone_requirement_ascending_order')}</li>
            <li>{t('milestone_requirement_milestones_optional')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
