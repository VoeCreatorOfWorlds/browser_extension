import { useState, useCallback, useEffect } from 'react';

interface TextExtractionService {
  extractTextFromPage: () => Promise<string>;
}

interface ExtractionResult {
  extractedText: string;
  loading: boolean;
  error: string | null;
  extractText: () => Promise<void>;
  clearExtractedText: () => void;
}

const textExtractionService: TextExtractionService = {
  extractTextFromPage: async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error("No active tab found");

      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // This function runs in the context of the web page
          const bodyText = document.body.innerText;
          const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
          const h1Text = Array.from(document.querySelectorAll('h1')).map(h1 => h1.innerText).join(' ');
          
          return {
            bodyText,
            metaDescription,
            h1Text,
          };
        },
      });

      if (!result || !('result' in result)) throw new Error("Failed to extract page contents");

      const { bodyText, metaDescription, h1Text } = result.result as { bodyText: string; metaDescription: string; h1Text: string };
      return `Meta Description: ${metaDescription}\n\nH1 Headings: ${h1Text}\n\nBody Text:\n${bodyText}`;
    } catch (error) {
      console.error("Error in extractTextFromPage:", error);
      throw error;
    }
  }
};

export const useTextExtraction = (): ExtractionResult => {
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const extractText = useCallback(async () => {
    console.log("Starting text extraction...");
    setLoading(true);
    setError(null);
    try {
      const text = await textExtractionService.extractTextFromPage();
      setExtractedText(text);
    } catch (err) {
      console.error("Error during extraction:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const clearExtractedText = useCallback(() => {
    setExtractedText('');
    setError(null);
  }, []);

  useEffect(() => {
    const handleTabChange = () => {
      clearExtractedText();
    };

    chrome.tabs.onActivated.addListener(handleTabChange);
    chrome.tabs.onUpdated.addListener(handleTabChange);

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabChange);
      chrome.tabs.onUpdated.removeListener(handleTabChange);
    };
  }, [clearExtractedText]);

  return { extractedText, loading, error, extractText, clearExtractedText };
};