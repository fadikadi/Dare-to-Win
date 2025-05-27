import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DownloadSamples() {
  const { t } = useTranslation();

  const downloadFile = (content, filename, contentType = 'application/json') => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadSampleQuestions = () => {
    const sampleQuestions = {
      "questions": [
        {
          "id": 1,
          "difficulty": "easy",
          "category": "general",
          "question": {
            "en": "What is the capital of France?",
            "ar": "ما هي عاصمة فرنسا؟"
          },
          "options": [
            { "en": "Paris", "ar": "باريس" },
            { "en": "London", "ar": "لندن" },
            { "en": "Berlin", "ar": "برلين" },
            { "en": "Madrid", "ar": "مدريد" }
          ],
          "correctIndex": 0
        },
        {
          "id": 2,
          "difficulty": "easy",
          "category": "general",
          "question": {
            "en": "How many days are there in a week?",
            "ar": "كم عدد الأيام في الأسبوع؟"
          },
          "options": [
            { "en": "5", "ar": "٥" },
            { "en": "6", "ar": "٦" },
            { "en": "7", "ar": "٧" },
            { "en": "8", "ar": "٨" }
          ],
          "correctIndex": 2
        },
        {
          "id": 3,
          "difficulty": "easy",
          "category": "general",
          "question": {
            "en": "What color is the sky on a clear day?",
            "ar": "ما لون السماء في يوم صافٍ؟"
          },
          "options": [
            { "en": "Red", "ar": "أحمر" },
            { "en": "Blue", "ar": "أزرق" },
            { "en": "Green", "ar": "أخضر" },
            { "en": "Yellow", "ar": "أصفر" }
          ],
          "correctIndex": 1
        },
        {
          "id": 4,
          "difficulty": "easy",
          "category": "general",
          "question": {
            "en": "How many legs does a spider have?",
            "ar": "كم عدد أرجل العنكبوت؟"
          },
          "options": [
            { "en": "6", "ar": "٦" },
            { "en": "8", "ar": "٨" },
            { "en": "10", "ar": "١٠" },
            { "en": "12", "ar": "١٢" }
          ],
          "correctIndex": 1
        },
        {
          "id": 5,
          "difficulty": "easy",
          "category": "general",
          "question": {
            "en": "What is 2 + 2?",
            "ar": "كم يساوي ٢ + ٢؟"
          },
          "options": [
            { "en": "3", "ar": "٣" },
            { "en": "4", "ar": "٤" },
            { "en": "5", "ar": "٥" },
            { "en": "6", "ar": "٦" }
          ],
          "correctIndex": 1
        },
        {
          "id": 6,
          "difficulty": "medium",
          "category": "science",
          "question": {
            "en": "What is the largest planet in our solar system?",
            "ar": "ما هو أكبر كوكب في نظامنا الشمسي؟"
          },
          "options": [
            { "en": "Earth", "ar": "الأرض" },
            { "en": "Jupiter", "ar": "المشتري" },
            { "en": "Saturn", "ar": "زحل" },
            { "en": "Mars", "ar": "المريخ" }
          ],
          "correctIndex": 1
        },
        {
          "id": 7,
          "difficulty": "medium",
          "category": "history",
          "question": {
            "en": "In which year did World War II end?",
            "ar": "في أي عام انتهت الحرب العالمية الثانية؟"
          },
          "options": [
            { "en": "1944", "ar": "١٩٤٤" },
            { "en": "1945", "ar": "١٩٤٥" },
            { "en": "1946", "ar": "١٩٤٦" },
            { "en": "1947", "ar": "١٩٤٧" }
          ],
          "correctIndex": 1
        },
        {
          "id": 8,
          "difficulty": "medium",
          "category": "science",
          "question": {
            "en": "What is the chemical symbol for gold?",
            "ar": "ما هو الرمز الكيميائي للذهب؟"
          },
          "options": [
            { "en": "Go", "ar": "جو" },
            { "en": "Au", "ar": "أو" },
            { "en": "Gd", "ar": "جد" },
            { "en": "Ag", "ar": "أج" }
          ],
          "correctIndex": 1
        },
        {
          "id": 9,
          "difficulty": "medium",
          "category": "geography",
          "question": {
            "en": "Which ocean is the largest?",
            "ar": "أي محيط هو الأكبر؟"
          },
          "options": [
            { "en": "Atlantic", "ar": "الأطلسي" },
            { "en": "Pacific", "ar": "الهادئ" },
            { "en": "Indian", "ar": "الهندي" },
            { "en": "Arctic", "ar": "المتجمد الشمالي" }
          ],
          "correctIndex": 1
        },
        {
          "id": 10,
          "difficulty": "medium",
          "category": "math",
          "question": {
            "en": "What is the square root of 64?",
            "ar": "ما هو الجذر التربيعي للعدد ٦٤؟"
          },
          "options": [
            { "en": "6", "ar": "٦" },
            { "en": "8", "ar": "٨" },
            { "en": "10", "ar": "١٠" },
            { "en": "12", "ar": "١٢" }
          ],
          "correctIndex": 1
        },
        {
          "id": 11,
          "difficulty": "hard",
          "category": "science",
          "question": {
            "en": "What is the molecular formula of water?",
            "ar": "ما هي الصيغة الجزيئية للماء؟"
          },
          "options": [
            { "en": "H2O", "ar": "H2O" },
            { "en": "CO2", "ar": "CO2" },
            { "en": "O2", "ar": "O2" },
            { "en": "H2SO4", "ar": "H2SO4" }
          ],
          "correctIndex": 0
        },
        {
          "id": 12,
          "difficulty": "hard",
          "category": "art",
          "question": {
            "en": "Who painted the Mona Lisa?",
            "ar": "من رسم لوحة الموناليزا؟"
          },
          "options": [
            { "en": "Leonardo da Vinci", "ar": "ليوناردو دا فينشي" },
            { "en": "Michelangelo", "ar": "مايكل أنجلو" },
            { "en": "Pablo Picasso", "ar": "بابلو بيكاسو" },
            { "en": "Vincent van Gogh", "ar": "فينسنت فان جوخ" }
          ],
          "correctIndex": 0
        },
        {
          "id": 13,
          "difficulty": "hard",
          "category": "science",
          "question": {
            "en": "What is the speed of light in vacuum?",
            "ar": "ما هي سرعة الضوء في الفراغ؟"
          },
          "options": [
            { "en": "299,792,458 m/s", "ar": "٢٩٩،٧٩٢،٤٥٨ م/ث" },
            { "en": "300,000,000 m/s", "ar": "٣٠٠،٠٠٠،٠٠٠ م/ث" },
            { "en": "150,000,000 m/s", "ar": "١٥٠،٠٠٠،٠٠٠ م/ث" },
            { "en": "250,000,000 m/s", "ar": "٢٥٠،٠٠٠،٠٠٠ م/ث" }
          ],
          "correctIndex": 0
        },
        {
          "id": 14,
          "difficulty": "hard",
          "category": "technology",
          "question": {
            "en": "Which programming language was created by Guido van Rossum?",
            "ar": "أي لغة برمجة أنشأها جويدو فان روسوم؟"
          },
          "options": [
            { "en": "Python", "ar": "بايثون" },
            { "en": "Java", "ar": "جافا" },
            { "en": "C++", "ar": "سي++" },
            { "en": "JavaScript", "ar": "جافا سكريبت" }
          ],
          "correctIndex": 0
        },
        {
          "id": 15,
          "difficulty": "hard",
          "category": "math",
          "question": {
            "en": "What is the smallest prime number?",
            "ar": "ما هو أصغر عدد أولي؟"
          },
          "options": [
            { "en": "2", "ar": "٢" },
            { "en": "1", "ar": "١" },
            { "en": "3", "ar": "٣" },
            { "en": "0", "ar": "٠" }
          ],
          "correctIndex": 0
        }
      ]
    };

    downloadFile(JSON.stringify(sampleQuestions, null, 2), 'sample-questions.json');
  };

  const downloadSampleMilestone = () => {
    const sampleMilestone = {
      "prizeAmounts": [
        100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000,
        64000, 125000, 250000, 500000, 1000000
      ],
      "milestones": [4, 9, 14],
      "description": {
        "en": "Classic Who Wants to Be a Millionaire prize structure",
        "ar": "هيكل الجوائز الكلاسيكي لمن سيربح المليون"
      }
    };

    downloadFile(JSON.stringify(sampleMilestone, null, 2), 'sample-milestone.json');
  };

  const downloadCustomMilestone = () => {
    const customMilestone = {
      "prizeAmounts": [
        50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000,
        100000, 200000, 400000, 800000, 1500000
      ],
      "milestones": [4, 9, 14],
      "description": {
        "en": "Custom prize structure with different amounts",
        "ar": "هيكل جوائز مخصص بمبالغ مختلفة"
      }
    };

    downloadFile(JSON.stringify(customMilestone, null, 2), 'custom-milestone.json');
  };

  return (
    <div className="download-samples-section">
      <h3>{t('download_sample_files')}</h3>
      <p className="download-instructions">
        {t('download_instructions')}
      </p>
      
      <div className="download-buttons">
        <button 
          className="download-button questions-download"
          onClick={downloadSampleQuestions}
        >
          {t('download_sample_questions')}
        </button>
        
        <button 
          className="download-button milestone-download"
          onClick={downloadSampleMilestone}
        >
          {t('download_sample_milestone')}
        </button>
        
        <button 
          className="download-button custom-download"
          onClick={downloadCustomMilestone}
        >
          {t('download_custom_milestone')}
        </button>
      </div>
      
      <div className="download-help">
        <h4>{t('sample_file_descriptions')}:</h4>
        <ul>
          <li><strong>{t('sample_questions_file')}:</strong> {t('sample_questions_description')}</li>
          <li><strong>{t('sample_milestone_file')}:</strong> {t('sample_milestone_description')}</li>
          <li><strong>{t('custom_milestone_file')}:</strong> {t('custom_milestone_description')}</li>
        </ul>
      </div>
    </div>
  );
}
