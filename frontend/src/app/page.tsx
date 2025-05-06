"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import FileUpload from '@/components/FileUpload';
import WhisperControl from '@/components/WhisperControl';
import QuestionInput, { QuestionMode } from '@/components/QuestionInput'; // Import QuestionMode
import AnswerDisplay from '@/components/AnswerDisplay';
import { searchInTranscription, SearchResult } from '@/lib/searchText';
// import { askLLM, LLMResult } from '@/lib/askLLM'; // Placeholder for LLM function

interface QAPair {
  id: string;
  question: string;
  mode: QuestionMode; // Added mode
  answer?: string;
  evidence?: string; // For transcription mode
  explanation?: string; // For LLM mode
  isProcessing: boolean;
  error?: string | null;
}

const MAX_QUESTIONS = 10;

// Placeholder for LLM function - to be created in step 004
async function askLLM(question: string): Promise<{ answer: string; explanation: string; error?: string | null}> {
  console.log(`LLMに質問を送信中（シミュレート）: "${question}"`);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
  if (question.toLowerCase().includes("error test")) {
    return { answer: "", explanation: "", error: "LLMからの応答取得中にエラーが発生しました（シミュレート）。" };
  }
  return {
    answer: `これは「${question}」に対するLLMのダミー回答です。手打ち興行とは、興行主が自ら企画し、費用を負担し、収益も損失もすべて自らで引き受ける興行形態を指します。特に都市部で行われることが多く、事務所やプロモーターが大きなリスクを負う代わりに、成功した場合の利益も大きくなります。`,
    explanation: `LLMからの詳細なダミー解説です。\n手打ち興行のメリットとしては、企画の自由度が高いこと、成功時のリターンが大きいことなどが挙げられます。一方、デメリットとしては、集客が振るわなかった場合などのリスクをすべて主催者が負う必要がある点です。\n\n対して「売り興行」は、地方の興行主などが、都市部のプロダクションやアーティストからパッケージ化された公演内容を買い取り、自身の地域で興行を行う形態です。この場合、地方の興行主は一定の金額を支払うことで、集客リスクの一部または大部分を軽減できますが、大きな利益も期待しにくいという特徴があります。\n\nご質問の選択肢について見てみましょう。\n① 手打ち興行とは地方公共ホールが主催する興行のことである → 誤り。手打ち興行は主に民間事業者（事務所など）が主催します。\n② 売り興行は、主催者が収益リスクを完全に負うモデルである → 誤り。売り興行は買い手側（地方興行主など）のリスクは限定的です。リスクを負うのはむしろ売り手側（コンテンツ提供側）や、手打ち興行の主催者です。\n③ 手打ち興行は、都市部でリスクと利益を事務所側がすべて負う自主興行のことである → 正しい説明です。\n④ 売り興行とは、アーティストが自主的に企画・実施する興行のことをいう → 誤り。これは手打ち興行の説明に近いか、あるいはインディーズ活動の形態です。\n⑤ 手打ち興行と売り興行では、収益モデルに大きな差異はない → 誤り。リスク負担と収益分配のモデルが大きく異なります。`,
    error: null,
  };
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string>("");
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [isTranscriptionExpanded, setIsTranscriptionExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (qaPairs.length === 0) {
      addQuestionPair();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addQuestionPair = () => {
    if (qaPairs.length < MAX_QUESTIONS) {
      setQaPairs(prev => [...prev, { 
        id: `q-${Date.now()}-${prev.length}`,
        question: '', 
        mode: 'transcription', // Default mode
        isProcessing: false 
      }]);
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setTranscriptionResult(""); 
    setQaPairs(prev => prev.map(qa => ({ ...qa, answer: undefined, evidence: undefined, explanation: undefined, error: null })));
  };

  const handleStartWhisper = async () => {
    if (!selectedFile) {
      alert('まずファイルを選択してください。');
      return;
    }
    setIsTranscribing(true);
    setTranscriptionResult("");
    console.log(`ファイル名: ${selectedFile.name} の文字起こしをシミュレート中`);
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    const dummyTranscription = `これはファイル ${selectedFile.name} のためのシミュレートされた文字起こしです。いくつかのサンプルテキストを含んでいます。例えば、「ライブ配信の著作権使用料はテレビ放送よりも低く設定されているわけですよ。」といった内容や、「サーカスの収入源としては飲食やグッズ販売も重要になるんですね。」といった点、「ライブハウスは基本的に飲食店とは法的に全く関係がないということになります。」ということ、そして最後に「演劇の興行期間は通常、数日間に限定されます。」といったことが考えられます。このテキストはテスト目的のものです。`.repeat(3);
    setTranscriptionResult(dummyTranscription);
    setIsTranscribing(false);
    console.log('文字起こしのシミュレーションが完了しました。');
  };

  const handleQuestionChange = (id: string, value: string) => {
    setQaPairs(prev => prev.map(qa => qa.id === id ? { ...qa, question: value } : qa));
  };

  const handleModeChange = (id: string, mode: QuestionMode) => {
    setQaPairs(prev => prev.map(qa => qa.id === id ? { ...qa, mode: mode, answer: undefined, evidence: undefined, explanation: undefined, error: null } : qa));
  };

  const processSingleQuestion = async (id: string): Promise<boolean> => {
    const currentPairIndex = qaPairs.findIndex(qa => qa.id === id);
    if (currentPairIndex === -1) return false;

    const currentPair = qaPairs[currentPairIndex];

    if (!currentPair.question.trim()) {
      if (!qaPairs.some(qa => qa.isProcessing && qa.id !== id)) alert('質問を入力してください。');
      return false;
    }

    setQaPairs(prev => prev.map(qa => qa.id === id ? { ...qa, isProcessing: true, answer: undefined, evidence: undefined, explanation: undefined, error: null } : qa));
    
    try {
      if (currentPair.mode === 'transcription') {
        if (!transcriptionResult) {
          if (!qaPairs.some(qa => qa.isProcessing && qa.id !== id)) alert('まずファイルを文字起こししてください。');
          setQaPairs(prev => prev.map(qa => qa.id === id ? { ...qa, isProcessing: false } : qa));
          return false;
        }
        console.log(`質問ID: ${id} の処理中 (文字起こし検索), 質問: "${currentPair.question}"`);
        const result: SearchResult = await searchInTranscription(transcriptionResult, currentPair.question);
        setQaPairs(prev => prev.map(qa => qa.id === id ? { ...qa, isProcessing: false, answer: result.answer, evidence: result.evidence, error: result.error } : qa));
      } else { // LLM Mode
        console.log(`質問ID: ${id} の処理中 (LLM質問), 質問: "${currentPair.question}"`);
        const result = await askLLM(currentPair.question); // Using placeholder LLM function
        setQaPairs(prev => prev.map(qa => qa.id === id ? { ...qa, isProcessing: false, answer: result.answer, explanation: result.explanation, error: result.error } : qa));
      }
      console.log(`質問ID: ${id} の処理が完了しました。`);
      return true;
    } catch (e) {
      console.error("質問処理中にエラーが発生しました:", e);
      setQaPairs(prev => prev.map(qa => qa.id === id ? { ...qa, isProcessing: false, error: "検索中に予期せぬエラーが発生しました。"} : qa));
      return false;
    }
  };
  
  const handleProcessAllQuestions = async () => {
    const validQaPairs = qaPairs.filter(qa => qa.question.trim() !== ''); // Corrected this line
    if (validQaPairs.length === 0) {
        alert('処理する質問がありません。質問を入力してください。');
        return;
    }
    const processingPromises = validQaPairs.map(qa => processSingleQuestion(qa.id));
    await Promise.all(processingPromises);
    console.log("全ての質問の処理が完了しました（または試行されました）。");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 sm:p-12 md:p-24 bg-slate-50">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-lg p-6 sm:p-8">
        <header className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Image 
                src="/humaaans-sitting.png"
                alt="プロジェクトで共同作業する人々のイラスト"
                width={150} 
                height={150} 
                className="opacity-90 rounded-full"
                priority
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600">Whisper Q&A</h1>
          <p className="text-slate-700 mt-2">音声をアップロードして文字起こしを行い、質問に対する答えやAIによる解説を見つけましょう。</p>
        </header>

        <section className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">ステップ1：アップロードと文字起こし (任意)</h2>
          <FileUpload 
            onFileSelect={handleFileSelect} 
            acceptedFileTypes="audio/*,.wav,.mp3,.m4a,.ogg,.flac" 
            displayAcceptedFileTypes="音声ファイル (.wav, .mp3, .m4a など)"
          />
          <WhisperControl 
            onStartWhisper={handleStartWhisper} 
            isTranscribing={isTranscribing} 
            disabled={!selectedFile || isTranscribing} 
          />
        </section>

        {isTranscribing && (
          <div className="text-center my-4 p-3 bg-indigo-100 rounded-md">
            <p className="text-indigo-700 animate-pulse">文字起こし中です、しばらくお待ちください...</p>
          </div>
        )}

        {transcriptionResult && !isTranscribing && (
          <section className="my-8 p-4 border border-slate-200 rounded-md bg-slate-100">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-slate-800">文字起こし結果：</h2>
              <button 
                onClick={() => setIsTranscriptionExpanded(!isTranscriptionExpanded)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {isTranscriptionExpanded ? '折りたたむ' : '表示する'}
              </button>
            </div>
            {isTranscriptionExpanded && (
              <p className="text-sm text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto p-2 bg-white rounded">{transcriptionResult}</p>
            )}
          </section>
        )}

        <section className="my-8">
          <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-slate-800">ステップ2：質問する</h2>
              {qaPairs.filter(qa => qa.question.trim() !== '').length > 1 && (
                  <button
                      type="button"
                      onClick={handleProcessAllQuestions}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      disabled={qaPairs.some(qa => qa.isProcessing)}
                  >
                      全ての質問を処理
                  </button>
              )}
          </div>
          {qaPairs.map((qaPair) => (
            <div key={qaPair.id} className="mb-6">
              <QuestionInput 
                id={qaPair.id} 
                question={qaPair.question} 
                currentMode={qaPair.mode}
                onQuestionChange={handleQuestionChange} 
                onModeChange={handleModeChange}
                onProcessQuestion={() => processSingleQuestion(qaPair.id)}
                isProcessing={qaPair.isProcessing}
                disabled={isTranscribing || qaPairs.some(item => item.isProcessing && item.id !== qaPair.id)} // Disable if any other item is processing or transcribing
              />
              <AnswerDisplay 
                answer={qaPair.answer}
                evidence={qaPair.evidence}
                explanation={qaPair.explanation}
                transcription={transcriptionResult} 
                currentMode={qaPair.mode}
                isLoading={qaPair.isProcessing}
                error={qaPair.error}
              />
            </div>
          ))}
          {qaPairs.length < MAX_QUESTIONS && (
            <button 
              type="button"
              onClick={addQuestionPair}
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-dashed border-slate-400 text-sm font-medium rounded text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isTranscribing || qaPairs.some(qa => qa.isProcessing)}
            >
              + 別の質問を追加 <span className="text-base ml-1">({qaPairs.length}/{MAX_QUESTIONS})</span>
            </button>
          )}
        </section>
        
      </div>
      <footer className="mt-12 text-center text-sm text-slate-600">
        <p>&copy; {new Date().getFullYear()} ryusukeyashiro. All rights reserved.</p>
        <p className="text-xs mt-1">Illustrations by <a href="https://blush.design/artists/pablo-stanley" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">Pablo Stanley</a> on <a href="https://blush.design" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">Blush.design</a></p>
      </footer>
    </main>
  );
}

