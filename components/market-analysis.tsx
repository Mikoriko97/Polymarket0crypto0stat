'use client';

import { useEffect, useState } from 'react';
import { getMarketAnalysis } from '@/lib/open-router';
import ReactMarkdown from 'react-markdown';

export function MarketAnalysis({ marketQuestion }: { marketQuestion: string }) {
  const [analysis, setAnalysis] = useState<string>('Loading analysis...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketQuestion) return;

    // Check cache (only on client)
    if (typeof window !== 'undefined') {
      try {
        const cachedAnalysis = localStorage.getItem(marketQuestion);
        if (cachedAnalysis) {
          const { analysis: cached, timestamp } = JSON.parse(cachedAnalysis);
          const isStale = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 hours
          if (!isStale) {
            setAnalysis(cached);
            return;
          }
        }
      } catch (err) {
        console.error('Error reading from localStorage:', err);
      }
    }

    // Fetch new analysis
    getMarketAnalysis(marketQuestion)
      .then((newAnalysis) => {
        const cleanedAnalysis = newAnalysis.replace(/<\|begin_of_sentence\|>/g, '').trim();
        
        // Save to cache (only on client)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(
              marketQuestion,
              JSON.stringify({ analysis: cleanedAnalysis, timestamp: Date.now() })
            );
          } catch (err) {
            console.error('Error writing to localStorage:', err);
          }
        }
        
        setAnalysis(cleanedAnalysis);
      })
      .catch((err) => {
        console.error('Error fetching analysis:', err);
        setError('Failed to load analysis. Please try again later.');
      });
  }, [marketQuestion]);

  return (
    <div className="neumorphic-inset p-4 rounded-lg prose dark:prose-invert max-w-none">
      <h2 className="text-xl font-bold mb-2">AI Analysis</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ReactMarkdown>{analysis}</ReactMarkdown>
      )}
    </div>
  );
}