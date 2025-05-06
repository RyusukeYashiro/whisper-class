export interface SearchResult {
    answer: string;
    evidence: string;
    error?: string | null;
  }
  
  // Predefined options based on the user's initial request
  const predefinedOptions = [
    { key: "ライブ配信の著作権使用料はテレビ放送よりも低く設定されているわけですよ。", answer: "A", fullSentence: "「ライブ配信の著作権使用料はテレビ放送よりも低く設定されているわけですよ。」" },
    { key: "サーカスの収入源としては飲食やグッズ販売も重要になるんですね。", answer: "B", fullSentence: "「サーカスの収入源としては飲食やグッズ販売も重要になるんですね。」" },
    { key: "ライブハウスは基本的に飲食店とは法的に全く関係がないということになります。", answer: "C", fullSentence: "「ライブハウスは基本的に飲食店とは法的に全く関係がないということになります。」" },
    { key: "演劇の興行期間は通常、数日間に限定されます。", answer: "D", fullSentence: "「演劇の興行期間は通常、数日間に限定されます。」" },
  ];
  
  /**
   * Searches for an answer to a question within a given transcription text.
   * Prioritizes matching predefined options, then falls back to general sentence matching.
   * @param transcription The full text of the transcription.
   * @param question The question to find an answer for.
   * @returns A Promise resolving to a SearchResult object.
   */
  export const searchInTranscription = async (
    transcription: string,
    question: string
  ): Promise<SearchResult> => {
    // Simulate async processing (e.g., API call to a more advanced search service)
    await new Promise(resolve => setTimeout(resolve, 500)); // Short delay to simulate async work
  
    const lowerQuestion = question.toLowerCase();
    const lowerTranscription = transcription.toLowerCase();
  
    // 1. Check against predefined options (more precise matching)
    for (const opt of predefinedOptions) {
      // Check if the question is asking about one of the options directly
      // Or if the question contains a significant part of the option's key phrase
      // Or if the transcription contains the option's key phrase (most important for finding evidence)
      if (
        lowerQuestion.includes(opt.answer.toLowerCase()) || // e.g., "Is it A?" or "What about option A?"
        lowerQuestion.includes(opt.key.toLowerCase().substring(0, 15)) || // e.g., question contains "ライブ配信の著作権使用料はテレビ"
        (lowerQuestion.includes("選択肢") && lowerQuestion.includes(opt.answer.toLowerCase())) // e.g. "選択肢Aについて"
      ) {
        // If the question seems to be about this option, verify its presence in the transcription
        if (lowerTranscription.includes(opt.key.toLowerCase())) {
          return {
            answer: `選択肢 ${opt.answer} が関連しているようです。`,
            evidence: opt.fullSentence, // Return the full, original-casing sentence
          };
        }
      } else {
          // Fallback: if the question is not directly asking for an option letter, 
          // but the transcription contains the option's key phrase, and the question might be the phrase itself.
          // This is useful if the user pastes one of the options as a question.
          if (lowerTranscription.includes(opt.key.toLowerCase()) && lowerQuestion.includes(opt.key.toLowerCase().substring(0,15))) {
               return {
                  answer: `はい、その内容は文字起こし内に含まれています。 (選択肢 ${opt.answer} に関連)`, 
                  evidence: opt.fullSentence
              };
          }
      }
    }
  
    // 2. More generic search: Find sentences in transcription that contain parts of the question
    // Split transcription into sentences. Handles Japanese periods and English periods.
    const sentences = transcription.split(/[.。]/g).filter(s => s.trim() !== '');
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      // Check if a significant portion of the question is in the sentence
      // This is a simple heuristic; more advanced NLP would be better here.
      const questionWords = lowerQuestion.split(/\s+/).filter(w => w.length > 1); // Split question into words
      let matchCount = 0;
      for (const word of questionWords) {
        if (lowerSentence.includes(word)) {
          matchCount++;
        }
      }
      // If more than half the question words (or at least 2 words) are in the sentence, consider it a potential match.
      if (questionWords.length > 0 && (matchCount / questionWords.length > 0.5 || (questionWords.length > 2 && matchCount >=2) || (questionWords.length <=2 && matchCount >=1) )) {
        return {
          answer: "以下の関連する可能性のある記述が見つかりました。",
          evidence: sentence.trim() + (transcription.includes(sentence.trim() + '。') ? '。' : ''), // Add period back if it was there
        };
      }
    }
    
    // 3. If the question itself is one of the predefined options' text
    for (const opt of predefinedOptions) {
      if (lowerQuestion.includes(opt.key.toLowerCase().substring(0, opt.key.length - 5))) { // Compare most of the sentence
        if (lowerTranscription.includes(opt.key.toLowerCase())) {
          return {
            answer: `はい、その内容は文字起こし内に含まれています。 (選択肢 ${opt.answer} に関連)`, 
            evidence: opt.fullSentence
          };
        }
      }
    }
  
    return {
      answer: "明確な回答や根拠は見つかりませんでした。",
      evidence: "",
    };
  };
  
  