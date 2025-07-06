import React, { useEffect, useState } from 'react';
import { getModerationQueue, updateModerationStatus, debugSurveyResponses } from '@/lib/supabase/db';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface QueueItem {
  id: string;
  unique_quality: string;
  attendee: {
    first_name: string;
    last_name: string | null;
    is_anonymous: boolean;
  };
  moderation: {
    status: 'pending' | 'approved' | 'rejected' | null;
    notes: string | null;
  } | null;
  created_at: string;
}

export function AdminPanel() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [moderatorId, setModeratorId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        console.log('Fetching moderation queue...');
        const data = await getModerationQueue();
        console.log('Queue data received:', data);
        setQueue(data as QueueItem[]);
      } catch (err) {
        console.error('Error fetching queue:', err);
        setError(err instanceof Error ? err.message : 'Failed to load moderation queue');
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, []);

  const handleModeration = async (
    responseId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      // Get the current user from supabase
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user?.id) {
        setError('No moderator user ID found. Please log in again.');
        return;
      }
      
      console.log('Attempting moderation with user ID:', user.id);
      
      const result = await updateModerationStatus(responseId, {
        status,
        moderator_id: user.id,
        notes,
      });
      
      console.log('Moderation successful:', result);
      
      setLoading(true);
      const queueData = await getModerationQueue();
      setQueue(queueData as QueueItem[]);
      setLoading(false);
    } catch (err) {
      console.error('Moderation error:', err);
      
      // If it's an RLS error, try a different approach
      if (err && typeof err === 'object' && 'code' in err && err.code === '42501') {
        setError('Permission denied. Please check if you have admin access or try refreshing the page.');
        
        // Try to refresh the user session
        try {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error('Session refresh error:', refreshError);
          }
        } catch (refreshErr) {
          console.error('Failed to refresh session:', refreshErr);
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update moderation status');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Response Moderation Queue
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              console.log('Debug button clicked');
              await debugSurveyResponses();
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Debug Data
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      )}

      {queue.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No responses waiting for moderation.
        </p>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow rounded-lg p-6 space-y-4"
            >
              <div className="flex justify-between items-start flex-col sm:flex-row">
                <div>
                  <p className="text-sm text-gray-500">
                    From: {item.attendee && item.attendee.first_name
                      ? `${item.attendee.first_name}${item.attendee.last_name ? ' ' + item.attendee.last_name : ''}`
                      : 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-full sm:w-auto mt-4 sm:mt-0">
                  <div className="flex flex-row space-x-2 w-full">
                    <button
                      onClick={() => { console.log('Approve clicked'); handleModeration(item.id, 'approved'); }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-1/2 sm:w-auto"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => { console.log('Reject clicked'); handleModeration(item.id, 'rejected'); }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 w-1/2 sm:w-auto"
                    >
                      Reject
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Tag (optional)"
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-gray-800">{item.unique_quality}</p>
              </div>
              <div>
                <label
                  htmlFor={`notes-${item.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Moderation Notes (Optional)
                </label>
                <textarea
                  id={`notes-${item.id}`}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add notes about your moderation decision..."
                  onChange={(e) =>
                    handleModeration(item.id, 'approved', e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 