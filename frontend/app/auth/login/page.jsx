'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/services';
import { setToken, setUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      if (!response.data || !response.data.token) {
        setError('Login failed: Invalid response from server');
        setLoading(false);
        return;
      }
      
      setToken(response.data.token);
      setUser(response.data.user);

      if (response.data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/tenant');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative">
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-300 hover:text-orange-400 transition"
      >
        ← Back to Home
      </button>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            TR
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Tonfox Rooms</h1>
          <p className="text-slate-400">Room Rental Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-orange-400 focus:outline-none transition"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-orange-400 focus:outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
          <p className="text-slate-300 text-sm font-medium mb-2">Example Login:</p>
          <div className="text-xs text-slate-400 space-y-1">
            <p><span className="text-orange-400">Email:</span> juandelacruz@gmail.com</p>
            <p><span className="text-orange-400">Password:</span> juan123</p>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/')}
            className="text-orange-400 hover:text-orange-300 font-medium transition"
          >
            Contact admin
          </button>
        </p>
      </div>
    </div>
  );
}
