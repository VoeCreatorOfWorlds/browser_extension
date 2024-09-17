import { useState } from 'react';
import './App.css'

const CopyButton = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button onClick={handleCopy} disabled={isCopied}>
      {isCopied ? 'Copied!' : 'Copy HTML'}
    </button>
  );
};

// Updated function to extract body content using DOMParser
function extractBodyContent(htmlString: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const bodyElement = doc.body;

  if (bodyElement) {
    return bodyElement.innerHTML;
  } else {
    return 'No body tag found in the HTML';
  }
}

function App() {
  const [pageHtml, setPageHtml] = useState<string>('');
  const [bodyContent, setBodyContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getPageData = async () => {
    setIsLoading(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.id) {
        throw new Error("No tab ID found");
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getPageHTML,
      });

      if (results && results[0] && results[0].result) {
        const htmlContent = results[0].result;
        setPageHtml(htmlContent);
        const extractedBody = extractBodyContent(htmlContent);
        setBodyContent(extractedBody);
        console.log('Body content:', extractedBody);
      } else {
        throw new Error("Failed to retrieve page HTML");
      }
    } catch (error: any) {
      console.error("An error occurred:", error);
      setPageHtml(`Error: ${error.message}`);
      setBodyContent('');
    } finally {
      setIsLoading(false);
    }
  }

  function getPageHTML() {
    return document.documentElement.outerHTML;
  }

  return (
    <div className="App">
      <h1>Page HTML Viewer</h1>
      <div className="card">
        <button onClick={getPageData} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Get Page HTML'}
        </button>
      </div>
      {pageHtml && (
        <div className="html-container">
          <h2>Full Page HTML:</h2>
          <CopyButton text={pageHtml} />
          <pre>{pageHtml}</pre>
        </div>
      )}
      {bodyContent && (
        <div className="body-container">
          <h2>Body Content:</h2>
          <CopyButton text={bodyContent} />
          <pre>{bodyContent}</pre>
        </div>
      )}
    </div>
  )
}

export default App 