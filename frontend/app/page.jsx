'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/tenant');
      }
    }
  }, [user, router]);

  if (!isClient) return null;

  // Show landing page if no user logged in
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
              TR
            </div>
            <span className="text-xl font-bold text-white">Tonfox Rooms</span>
          </div>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold px-6 py-2 rounded-lg transition transform hover:scale-105"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Tonfox Rooms</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
Affordable airconditioned rooms.
Comfortable, accessible, and perfect for everyday living.
</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold px-8 py-4 rounded-lg transition transform hover:scale-105 text-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 font-bold px-8 py-4 rounded-lg transition text-lg"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Why Choose Tonfox Rooms?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <FeatureCard
  icon="💸"
  title="Affordable Living"
  description="Clean and comfortable rooms at a budget-friendly price. Perfect for workers, students, and small families."
/>

<FeatureCard
  icon="❄️"
  title="All Rooms Airconditioned"
  description="Every room is fully airconditioned for your comfort — stay cool day and night."
/>

<FeatureCard
  icon="📍"
  title="Prime Location"
  description="Located near Cordova Town Square — easy access to food, transport, and daily essentials."
/>

<FeatureCard
  icon="🛒"
  title="Close to Gaisano"
  description="Convenient distance from Gaisano for groceries, shopping, and everyday needs."
/>

<FeatureCard
  icon="🚶"
  title="Accessible Area"
  description="Near main roads and transportation routes — perfect for commuters."
/>

<FeatureCard
  icon="🏠"
  title="Simple & Peaceful"
  description="A safe and quiet place to rest after work or school."
/>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">For Everyone</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Admin Card */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-8 text-white transform hover:scale-105 transition">
              <div className="text-5xl mb-4">👨‍💼</div>
              <h3 className="text-2xl font-bold mb-4">Property Owners</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Manage all rooms and tenants</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Generate and track bills</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Record payments and view reports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Input meter readings</span>
                </li>
              </ul>
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-white text-blue-600 font-bold py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Admin Login
              </button>
            </div>

            {/* Tenant Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-8 text-white transform hover:scale-105 transition">
              <div className="text-5xl mb-4">👤</div>
              <h3 className="text-2xl font-bold mb-4">Tenants</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>View your bill information</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Check payment history</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Download receipts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Read announcements</span>
                </li>
              </ul>
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-white text-green-600 font-bold py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Tenant Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-orange-400 to-red-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Rent here at Tonfox Rooms and experience a relaxing stay.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-white text-orange-500 hover:bg-gray-100 font-bold px-8 py-4 rounded-lg transition transform hover:scale-105 text-lg"
          >
            Login Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p>&copy; 2026 Tonfox Rooms. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-6 hover:border-orange-400 transition hover:shadow-lg hover:shadow-orange-500/20">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-300">{description}</p>
    </div>
  );
}
