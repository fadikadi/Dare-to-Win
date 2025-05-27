# Millionaire Game

This is a bilingual (English/Arabic) version of "Who Wants to Be a Millionaire?" built with React and Vite.

## Features
- 15 questions per game with difficulty-based progression
- 4 multiple-choice answers per question
- 3 lifelines: 50:50, Ask the Audience, Phone a Friend
- Configurable milestone levels and prize amounts
- English/Arabic language toggle with full RTL support
- **File Upload System**: Upload custom questions and milestone configurations
- **Sample File Downloads**: Download templates and examples
- **Persistent Settings**: Uploaded files become the new defaults

## Getting Started

1. Install dependencies:
   ```powershell
   npm install
   ```
2. Start the development server:
   ```powershell
   npm run dev
   ```

## Game Structure

### Question Difficulty Levels
- **Questions 1-5**: Easy (First milestone)
- **Questions 6-10**: Medium (Second milestone) 
- **Questions 11-15**: Hard (Final section)

### File Upload Features

#### Custom Questions
Upload your own questions in JSON format. The game requires:
- Minimum 5 questions per difficulty level (easy, medium, hard)
- Bilingual support (English and Arabic)
- Proper JSON structure with question, options, and correct answer

#### Custom Milestones
Upload custom prize structures with:
- Exactly 15 prize amounts
- Optional milestone checkpoints (defaults: questions 5, 10, 15)
- Ascending prize values

### Making Uploads Permanent

When you upload files through the game interface:

1. **Automatic Download**: Files are automatically downloaded to your Downloads folder
2. **Manual Replacement**: 
   - Replace `src/data/questions.json` with your uploaded questions file
   - Replace `src/data/milestone.json` with your uploaded milestone file
3. **Using Update Script** (Recommended):
   ```powershell
   # Windows PowerShell
   .\update-defaults.ps1
   
   # Or Node.js
   node update-defaults.js
   ```

The update script will:
- Look for uploaded files in your Downloads folder
- Create backups of your current files
- Replace the defaults with uploaded versions
- Clean up the Downloads folder

## Project Structure
```
src/
├── components/           # React components
│   ├── FileUpload.jsx   # Questions file upload
│   ├── MilestoneUpload.jsx # Milestone file upload
│   ├── DownloadSamples.jsx # Sample file downloads
│   └── ...
├── data/                # Game data
│   ├── questions.json   # Questions database
│   └── milestone.json   # Prize structure
└── i18n/               # Internationalization
    └── translations.json # UI translations
```

## Sample Files

Download sample files from the game interface to understand the required format:

1. **Sample Questions**: Complete example with 15 questions
2. **Sample Milestone**: Default prize structure ($100 to $1,000,000)
3. **Custom Milestone**: Template with different prize amounts

## File Formats

### Questions File Format
```json
{
  "questions": [
    {
      "id": 1,
      "difficulty": "easy",
      "category": "general",
      "question": {
        "en": "Question in English?",
        "ar": "السؤال بالعربية؟"
      },
      "options": [
        { "en": "Option A", "ar": "الخيار أ" },
        { "en": "Option B", "ar": "الخيار ب" },
        { "en": "Option C", "ar": "الخيار ج" },
        { "en": "Option D", "ar": "الخيار د" }
      ],
      "correctIndex": 0
    }
  ]
}
```

### Milestone File Format
```json
{
  "prizeAmounts": [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000],
  "milestones": [4, 9, 14],
  "description": {
    "en": "Prize structure description",
    "ar": "وصف هيكل الجوائز"
  }
}
```

## Customization
- Upload custom questions and milestones through the game interface
- Modify UI translations in `/src/i18n/translations.json`
- Adjust styling in `/src/App.css`

## Development

Built with:
- React 18
- Vite
- i18next for internationalization
- CSS with RTL support

---

This project was bootstrapped with [Vite](https://vitejs.dev/).
