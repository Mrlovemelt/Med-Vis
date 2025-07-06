"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    console.log('Attempting login with email:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Login response:', { data, error });
      
      if (error) {
        console.error('Login error:', error);
        setError(error.message);
      } else {
        console.log('Login successful, user:', data.user);
        console.log('User metadata:', data.user?.user_metadata);
        router.push('/admin');
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      if (error) {
        setError(error.message);
      } else {
        setResetSent(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-4">
      {showReset ? (
        <form onSubmit={handleReset} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full border p-2" 
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Password Reset'}
          </button>
          <button 
            type="button" 
            className="w-full border p-2 rounded" 
            onClick={() => setShowReset(false)}
          >
            Back to Login
          </button>
          {resetSent && <div className="text-green-600">Password reset email sent!</div>}
          {error && <div className="text-red-600">{error}</div>}
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full border p-2" 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="w-full border p-2" 
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <button 
            type="button" 
            className="w-full border p-2 rounded" 
            onClick={() => setShowReset(true)}
          >
            Forgot Password?
          </button>
          {error && <div className="text-red-600">{error}</div>}
        </form>
      )}
    </div>
  );
} 