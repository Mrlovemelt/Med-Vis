'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase/types';

interface ApprovedQuote {
  unique_quality: string;
  attendee: {
    first_name: string;
    last_name: string | null;
    is_anonymous: boolean;
  };
}

export function useApprovedQuotes() {
  const [quotes, setQuotes] = useState<ApprovedQuote[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  // Fetch approved quotes
  useEffect(() => {
    let mounted = true;

    async function fetchQuotes() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch directly from survey_responses where status is approved
        const { data, error: fetchError } = await supabase
          .from('survey_responses')
          .select(`
            unique_quality,
            attendee:attendees (
              first_name,
              last_name,
              is_anonymous
            )
          `)
          .eq('status', 'approved')
          .not('unique_quality', 'is', null)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (mounted) {
          const filteredQuotes = data
            ?.filter(item => item.unique_quality && item.unique_quality.trim() !== '')
            .map(item => ({
              unique_quality: item.unique_quality,
              attendee: Array.isArray(item.attendee) ? item.attendee[0] : item.attendee
            })) || [];
          
          console.log('Fetched quotes:', filteredQuotes.length, filteredQuotes);
          setQuotes(filteredQuotes);
        }
      } catch (err) {
        console.error('Error fetching quotes:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch quotes');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchQuotes();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  // Rotate quotes every 8 seconds
  useEffect(() => {
    if (quotes.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  const currentQuote = quotes[currentQuoteIndex];

  const formatQuote = (quote: ApprovedQuote) => {
    if (!quote) return null;
    
    const { unique_quality, attendee } = quote;
    let authorName = 'Anonymous';
    
    if (!attendee.is_anonymous && attendee.first_name) {
      authorName = attendee.first_name;
      if (attendee.last_name) {
        authorName += ` ${attendee.last_name}`;
      }
    }
    
    return {
      text: unique_quality,
      author: authorName
    };
  };

  return {
    quotes,
    currentQuote: currentQuote ? formatQuote(currentQuote) : null,
    isLoading,
    error,
    hasQuotes: quotes.length > 0
  };
} 