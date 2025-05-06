import React from 'react';
import { QuestionMode } from './QuestionInput'; // Assuming QuestionMode is exported from QuestionInput.tsx

interface AnswerDisplayProps {
  answer?: string;
  evidence?: string; // For transcription mode
  explanation?: string; // For LLM mode
  transcription?: string; // Full transcription to search for evidence highlighting
  currentMode: QuestionMode;
  isLoading?: boolean;
  error?: string | null;
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({
  answer,
  evidence,
  explanation,
  transcription,
  currentMode,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="mt-3 p-3 border border-slate-200 rounded-lg bg-slate-100 animate-pulse">
        <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-slate-300 rounded w-1/2 mb-3"></div>
        <div className="h-3 bg-slate-300 rounded w-full"></div>
        <div className="h-3 bg-slate-300 rounded w-full mt-1"></div>
        <div className="h-3 bg-slate-300 rounded w-5/6 mt-1"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-3 p-3 border border-red-300 rounded-lg bg-red-50/80">
        <p className="text-sm font-semibold text-red-700">エラー:</p>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!answer && ((currentMode === 'transcription' && !evidence) || (currentMode === 'llm' && !explanation))) {
    return null;
  }

  const getHighlightedEvidence = () => {
    if (!evidence || !transcription) {
      return <p className="text-sm text-slate-700 bg-yellow-100 p-2 rounded whitespace-pre-wrap">{evidence || ''}</p>;
    }
    const escapedEvidence = evidence.replace(/[.*+?^${}()|[\\\]]/g, '\\$&');
    const parts = transcription.split(new RegExp(`(${escapedEvidence})`, 'gi'));

    if (parts.length <= 1) {
      return <p className="text-sm text-slate-700 bg-yellow-100 p-2 rounded whitespace-pre-wrap"><mark className="bg-yellow-300 px-0.5 rounded">{evidence}</mark></p>;
    }

    return (
      <p className="text-sm text-slate-700 bg-slate-200 p-2 rounded whitespace-pre-wrap">
        {parts.map((part, index) =>
          part.toLowerCase() === evidence.toLowerCase() ? (
            <mark key={index} className="bg-yellow-300 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </p>
    );
  };

  return (
    <div className="mt-3 p-3 border border-slate-200 rounded-lg bg-slate-100 shadow-sm">
      {answer && (
        <div className="mb-3">
          <p className="text-sm font-bold text-slate-800">回答：</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{answer}</p>
        </div>
      )}
      {currentMode === 'transcription' && evidence && (
        <div>
          <p className="text-sm font-bold text-slate-800">根拠（文字起こしより）：</p>
          {getHighlightedEvidence()}
        </div>
      )}
      {currentMode === 'llm' && explanation && (
        <div>
          <p className="text-sm font-bold text-slate-800">解説：</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-200 p-2 rounded">{explanation}</p>
        </div>
      )}
    </div>
  );
};

export default AnswerDisplay;

