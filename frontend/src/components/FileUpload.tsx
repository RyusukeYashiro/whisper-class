import React, { useState, ChangeEvent } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedFileTypes?: string; // 例: "audio/*,video/mp4,.customext"
  displayAcceptedFileTypes?: string; // 例: "音声ファイルまたはMP4動画"
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, acceptedFileTypes, displayAcceptedFileTypes }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      let isValid = false;
      if (acceptedFileTypes) {
        const allowedTypes = acceptedFileTypes.split(',').map(type => type.trim().toLowerCase());
        const fileType = file.type.toLowerCase();
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        for (const allowedType of allowedTypes) {
          if (allowedType.startsWith('.')) { // 拡張子チェック
            if (fileExtension === allowedType.substring(1)) {
              isValid = true;
              break;
            }
          } else if (allowedType.endsWith('/*')) { // ワイルドカードMIMEタイプチェック (例: audio/*)
            if (fileType.startsWith(allowedType.slice(0, -2))) {
              isValid = true;
              break;
            }
          } else { // 完全一致MIMEタイプチェック
            if (fileType === allowedType) {
              isValid = true;
              break;
            }
          }
        }
        // .wav ファイルのための追加チェック (MIMEタイプが空か汎用的である場合があるため)
        if (!isValid && fileExtension === 'wav') {
            if (allowedTypes.includes('audio/*') || allowedTypes.includes('audio/wav') || allowedTypes.includes('.wav')) {
                isValid = true;
            }
        }

        if (!isValid) {
          const displayTypes = displayAcceptedFileTypes || acceptedFileTypes;
          setError(`無効なファイル形式です。${displayTypes} ファイルを選択してください。`);
          setSelectedFile(null);
          setFileName('');
          onFileSelect(null);
          event.target.value = ''; // ファイル選択をリセット
          return;
        }
      }
      setSelectedFile(file);
      setFileName(file.name);
      setError('');
      onFileSelect(file);
    } else {
      setSelectedFile(null);
      setFileName('');
      setError('');
      onFileSelect(null);
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 mb-1">
        文字起こしファイルを選択
      </label>
      <div className="mt-1 flex items-center">
        <label className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <span>ファイルを選択</span>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept={acceptedFileTypes} />
        </label>
        {fileName && <span className="ml-3 text-sm text-slate-500">{fileName}</span>}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FileUpload;

