import React from 'react';

export type QuestionMode = 'transcription' | 'llm';

interface QuestionInputProps {
  id: string;
  question: string;
  currentMode: QuestionMode;
  onQuestionChange: (id: string, value: string) => void;
  onModeChange: (id: string, mode: QuestionMode) => void;
  onProcessQuestion: (id: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

const QuestionInput: React.FC<QuestionInputProps> = ({
  id,
  question,
  currentMode,
  onQuestionChange,
  onModeChange,
  onProcessQuestion,
  isProcessing,
  disabled,
}) => {
  return (
    <div className="p-4 border border-slate-200 rounded-lg mb-4 bg-white shadow">
      <div className="mb-3">
        <label htmlFor={`question-${id}`} className="block text-sm font-medium text-slate-700 mb-1">
          質問
        </label>
        <textarea
          id={`question-${id}`}
          name={`question-${id}`}
          rows={9}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md bg-slate-50 text-slate-900 disabled:opacity-70 pl-3 pr-3 py-2" // Added pl-3 pr-3 py-2 for padding
          value={question}
          onChange={(e) => onQuestionChange(id, e.target.value)}
          disabled={disabled || isProcessing}
        />
      </div>

      <div className="mb-3">
        <span className="block text-sm font-medium text-slate-700 mb-1">処理モード選択</span>
        <div className="flex items-center space-x-4">
          <div>
            <input 
              type="radio" 
              id={`mode-transcription-${id}`} 
              name={`mode-${id}`} 
              value="transcription" 
              checked={currentMode === 'transcription'}
              onChange={() => onModeChange(id, 'transcription')}
              disabled={disabled || isProcessing}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300"
            />
            <label htmlFor={`mode-transcription-${id}`} className="ml-2 text-sm text-slate-700">
              文字起こしから検索
            </label>
          </div>
          <div>
            <input 
              type="radio" 
              id={`mode-llm-${id}`} 
              name={`mode-${id}`} 
              value="llm" 
              checked={currentMode === 'llm'}
              onChange={() => onModeChange(id, 'llm')}
              disabled={disabled || isProcessing}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300"
            />
            <label htmlFor={`mode-llm-${id}`} className="ml-2 text-sm text-slate-700">
              LLMに質問 (AI回答)
            </label>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onProcessQuestion(id)}
        disabled={disabled || isProcessing || !question.trim()}
        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            処理中...
          </>
        ) : (
          'この質問を処理'
        )}
      </button>
    </div>
  );
};

export default QuestionInput;

