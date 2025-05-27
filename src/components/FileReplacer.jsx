import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FileReplacer() {
  const { t } = useTranslation();
  const [isReplacing, setIsReplacing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleReplaceFiles = async () => {
    setIsReplacing(true);
    setLastResult(null);

    try {
      // Call the PowerShell script to replace files
      const response = await fetch('/api/replace-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.text();
        setLastResult({ success: true, message: result });
        
        // Reload the page to use the new default files
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setLastResult({ success: false, message: 'Failed to replace files' });
      }
    } catch (error) {
      console.error('Error replacing files:', error);
      setLastResult({ success: false, message: 'Error: ' + error.message });
    } finally {
      setIsReplacing(false);
    }
  };

  const handleManualReplace = () => {
    const instructions = `
To manually replace default files:

1. Copy your custom questions.json to: src/data/questions.json
2. Copy your custom milestone.json to: src/data/milestone.json
3. Restart the development server

Or run this PowerShell command in the project directory:
.\\update-defaults.ps1 -mode Auto

This will copy files from your Downloads folder to the project.
    `;
    
    alert(instructions);
  };

  return (
    <div className="file-replacer">
      <h3>{t('replace_default_files') || 'Replace Default Files'}</h3>
      <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
        {t('replace_files_description') || 'Make your uploaded files the new permanent defaults'}
      </p>
      
      <div className="replacer-buttons">
        <button 
          onClick={handleReplaceFiles}
          disabled={isReplacing}
          className="replace-button"
        >
          {isReplacing ? (t('replacing') || 'Replacing...') : (t('auto_replace') || 'Auto Replace Files')}
        </button>
        
        <button 
          onClick={handleManualReplace}
          className="manual-button"
          style={{ marginLeft: '10px' }}
        >
          {t('manual_instructions') || 'Manual Instructions'}
        </button>
      </div>

      {lastResult && (
        <div className={`result-message ${lastResult.success ? 'success' : 'error'}`}>
          {lastResult.message}
          {lastResult.success && (
            <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
              {t('reloading_page') || 'Reloading page to use new defaults...'}
            </div>
          )}
        </div>
      )}

      <div className="replacer-info" style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <strong>{t('how_it_works') || 'How it works'}:</strong>
        <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
          <li>{t('copies_from_downloads') || 'Copies questions.json and milestone.json from Downloads folder'}</li>
          <li>{t('creates_backups') || 'Creates backups of current default files'}</li>
          <li>{t('replaces_defaults') || 'Replaces the default files in src/data/'}</li>
          <li>{t('permanent_change') || 'Changes persist when restarting the game'}</li>
        </ul>
      </div>
    </div>
  );
}