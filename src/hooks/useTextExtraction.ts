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
          try {
            const isValidTextContent = (text: string): boolean => {
              // Filter out JavaScript-like content
              if (/^function\s*\(/.test(text) || /\{.*\}/.test(text) || /var\s+\w+\s*=/.test(text)) {
                return false;
              }
              // Filter out class names and other non-semantic content
              if (/^[a-zA-Z-]+[-_]?[a-zA-Z0-9-]+$/.test(text)) {
                return false;
              }
              return true;
            };

            const addDelimiters = (element: HTMLElement): string | null => {
              if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
                return null;
              }

              let textWithDelimiters = '';

              element.childNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const el = node as HTMLElement;

                  if (/^H[1-6]$/.test(el.tagName)) {
                    const headingText = el.innerText.trim();
                    if (headingText && isValidTextContent(headingText)) {
                      textWithDelimiters += `\n===SECTION (Heading ${el.tagName})===\n${headingText}\n`;
                    }
                  } else if (el.tagName === 'LI') {
                    const itemText = el.innerText.trim();
                    if (itemText && isValidTextContent(itemText)) {
                      textWithDelimiters += `\n===ITEM===\n${itemText}\n`;
                    }
                  } else if (el.tagName === 'TR') {
                    const cells = Array.from(el.querySelectorAll('td, th'))
                      .map(cell => (cell as HTMLElement).innerText.trim())
                      .filter(isValidTextContent)
                      .join(' | ');
                    if (cells) {
                      textWithDelimiters += `\n===ROW===\n${cells}\n`;
                    }
                  } else if (el.tagName === 'DIV' || el.tagName === 'SECTION') {
                    const containerContent = addDelimiters(el);
                    if (containerContent) {
                      textWithDelimiters += `\n---CONTAINER START (${el.tagName})---\n${containerContent}\n---CONTAINER END---\n`;
                    }
                  } else {
                    const content = addDelimiters(el);
                    if (content) {
                      textWithDelimiters += content;
                    }
                  }
                } else if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                  const text = node.textContent.trim();
                  if (text && isValidTextContent(text)) {
                    textWithDelimiters += `\n${text}\n`;
                  }
                }
              });

              return textWithDelimiters.trim() ? textWithDelimiters : null;
            };

            const bodyTextWithDelimiters = addDelimiters(document.body as HTMLElement) || '';
            const metaDescription = (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.getAttribute('content') || '';
            const h1Text = Array.from(document.querySelectorAll('h1'))
              .map(h1 => (h1 as HTMLElement).innerText.trim())
              .filter(isValidTextContent)
              .join(' ');

            return {
              bodyTextWithDelimiters,
              metaDescription,
              h1Text,
            };
          } catch (error) {
            console.error('Error during DOM parsing:', error);
            return null;
          }
        },
      });

      if (!result || !('result' in result) || !result.result) {
        throw new Error("Failed to extract page contents or script returned null");
      }

      const { bodyTextWithDelimiters, metaDescription, h1Text } = result.result as { bodyTextWithDelimiters: string; metaDescription: string; h1Text: string };
      return `Meta Description: ${metaDescription}\n\nH1 Headings: ${h1Text}\n\nBody Text with Delimiters:\n${bodyTextWithDelimiters}`;
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