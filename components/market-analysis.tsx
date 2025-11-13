'use client';

import { useEffect, useState } from 'react';
import { getMarketAnalysis, AnalysisResult } from '@/lib/open-router';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/components/ui/use-toast';

export function MarketAnalysis({ marketQuestion }: { marketQuestion: string }) {
  const [analysis, setAnalysis] = useState<string>('Loading analysis...');
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const { toast } = useToast();

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
      .then((res: AnalysisResult) => {
        if (res.latencyMs != null) setLatencyMs(res.latencyMs)
        if (res.ok && res.content) {
          const cleanedAnalysis = res.content.replace(/<\|begin_of_sentence\|>/g, '').trim()
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(
                marketQuestion,
                JSON.stringify({ analysis: cleanedAnalysis, timestamp: Date.now() })
              )
            } catch {}
          }
          setAnalysis(cleanedAnalysis)
          setError(null)
          toast({ title: 'AI Ready', description: `${res.latencyMs ?? 0}ms`, variant: 'default' })
        } else {
          setError('Failed to load analysis.')
          toast({ title: 'AI Error', description: res.errorCode || 'unknown', variant: 'destructive' })
        }
      })
      .catch(() => {
        setError('Failed to load analysis.')
        toast({ title: 'AI Error', description: 'network', variant: 'destructive' })
      })
  }, [marketQuestion]);

  return (
    <div className="neumorphic-inset p-4 rounded-lg prose dark:prose-invert max-w-none">
      <h2 className="text-xl font-bold mb-2">AI Analysis</h2>
      {latencyMs != null ? (<p className="text-xs text-text-secondary">Latency: {latencyMs}ms</p>) : null}
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ReactMarkdown>{analysis}</ReactMarkdown>
      )}
    </div>
  );
}
