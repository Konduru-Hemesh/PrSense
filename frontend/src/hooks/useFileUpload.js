import { useCallback, useState } from 'react';
import useAnalysisStore from '../store/analysisStore';
import { inferLanguageFromCode, inferLanguageFromFileName } from '../utils/languageDetection';

export default function useFileUpload() {
  const [isReading, setIsReading] = useState(false);
  const setCode = useAnalysisStore((state) => state.setCode);
  const setLanguage = useAnalysisStore((state) => state.setLanguage);
  const languageSource = useAnalysisStore((state) => state.languageSource);
  const setUploadedFileName = useAnalysisStore((state) => state.setUploadedFileName);

  const handleFileUpload = useCallback((file) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    setIsReading(true);

    reader.onload = (event) => {
      const text = String(event.target?.result || '');
      setUploadedFileName(file.name);
      setCode(text, 'upload');
      const inferredFromFile = inferLanguageFromFileName(file.name);
      const inferredFromCode = inferLanguageFromCode(text);
      const nextLanguage = inferredFromFile || inferredFromCode;
      if (nextLanguage && languageSource !== 'manual') {
        setLanguage(nextLanguage, 'auto');
      }
      setIsReading(false);
    };

    reader.onerror = () => {
      setIsReading(false);
      window.dispatchEvent(new CustomEvent('prsense-toast', {
        detail: {
          message: 'Unable to read the selected file.',
          tone: 'error',
        },
      }));
    };

    reader.readAsText(file);
  }, [languageSource, setCode, setLanguage, setUploadedFileName]);

  return {
    isReading,
    handleFileUpload,
  };
}
