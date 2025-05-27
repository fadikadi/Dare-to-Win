import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function FileUpload({ onQuestionsLoaded, currentQuestionsCount }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const saveQuestionsToProject = async (questionsData) => {
    try {
      // Create a downloadable file that will replace the default questions.json
      const jsonString = JSON.stringify(questionsData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'questions.json';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Also save to localStorage for persistence
      localStorage.setItem('customQuestions', jsonString);
      
      // Show instructions to user
      setTimeout(() => {
        alert(t('questions_saved_instructions'));
      }, 1000);
    } catch (error) {
      console.error('Error saving questions:', error);
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
        if (!jsonContent.questions || !Array.isArray(jsonContent.questions)) {
          alert(t('invalid_json_structure'));
          return;
        }

        // Validate each question has required fields
        const isValidStructure = jsonContent.questions.every(q => 
          q.id && 
          q.difficulty && 
          q.question && 
          q.question.en && 
          q.question.ar && 
          q.options && 
          Array.isArray(q.options) && 
          q.options.length === 4 &&
          q.options.every(opt => opt.en && opt.ar) &&
          typeof q.correctIndex === 'number' &&
          q.correctIndex >= 0 && 
          q.correctIndex <= 3
        );

        if (!isValidStructure) {
          alert(t('invalid_question_structure'));
          return;
        }

        // Check difficulty distribution
        const difficulties = jsonContent.questions.reduce((acc, q) => {
          acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
          return acc;
        }, {});

        if (!difficulties.easy || !difficulties.medium || !difficulties.hard) {
          alert(t('missing_difficulty_levels'));
          return;
        }

        if (difficulties.easy < 5 || difficulties.medium < 5 || difficulties.hard < 5) {
          alert(t('insufficient_questions_per_difficulty'));
          return;
        }        // Success - pass the questions to parent component
        onQuestionsLoaded(jsonContent);
        
        // Save to localStorage and download for manual placement
        saveQuestionsToProject(jsonContent);
        
        alert(t('questions_loaded_successfully', { 
          count: jsonContent.questions.length,
          easy: difficulties.easy,
          medium: difficulties.medium,
          hard: difficulties.hard
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

  return (
    <div className="file-upload-section">
      <div className="current-questions-info">
        <p className="questions-count">
          {t('current_questions_count', { count: currentQuestionsCount })}
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
        className="upload-button"
        onClick={triggerFileUpload}
      >
        {t('upload_questions_file')}
      </button>
      
      <div className="upload-help">
        <p className="upload-instructions">
          {t('upload_instructions')}
        </p>
        <div className="format-requirements">
          <h4>{t('file_format_requirements')}:</h4>
          <ul>
            <li>{t('requirement_json_format')}</li>
            <li>{t('requirement_questions_array')}</li>
            <li>{t('requirement_bilingual')}</li>
            <li>{t('requirement_difficulty_levels')}</li>
            <li>{t('requirement_minimum_questions')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
