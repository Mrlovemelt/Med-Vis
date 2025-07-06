"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminPanel } from '@/components/AdminPanel/index';
import Layout from '@/components/Layout';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Admin page - User:', user);
        
        if (!user) {
          console.log('No user found, redirecting to login');
          router.replace('/login');
          return;
        }
        
        if (!user.user_metadata || user.user_metadata.role !== 'admin') {
          console.log('User is not admin, redirecting to login');
          router.replace('/login');
          return;
        }
        
        setUser(user);
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  if (!user || !user.user_metadata || user.user_metadata.role !== 'admin') {
    return <div className="flex items-center justify-center h-96">Access denied</div>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Response Moderation
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Review and moderate survey responses to ensure appropriate content for
            visualization.
          </p>
        </div>

        <AdminPanel />
      </div>
    </Layout>
  );
} 