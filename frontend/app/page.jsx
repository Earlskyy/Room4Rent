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

  return (
    <div className="min-h-screen relative bg-slate-950">

      {/* Fixed Background Image - Stays put while you scroll */}
      <div
        className="fixed inset-0 bg-cover bg-no-repeat z-0"
        style={{
          backgroundImage: `url('https://imgur.com/Rtj21ct.jpg')`,
          backgroundPosition: 'center 30%', // Focuses slightly above the middle
        }}
      ></div>

      {/* Dark Gradient Overlay - Also fixed to keep text readable throughout */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/95 z-0"></div>

      {/* Page Content - Set to relative and higher Z-index to sit on top */}
      <div className="relative z-10">

        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                TR
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Tonfox Rooms</span>
            </div>
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold px-6 py-2 rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              Login
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-48 pb-32 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Welcome to <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Tonfox Rooms</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Affordable airconditioned rooms. Comfortable, accessible, and perfect for everyday living in Cordova.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/auth/login')}
                className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold px-10 py-4 rounded-xl transition transform hover:scale-105 text-lg shadow-xl shadow-orange-500/20"
              >
                Get Started
              </button>
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="backdrop-blur-md border-2 border-orange-400/50 text-orange-400 hover:bg-orange-400 hover:text-slate-900 font-bold px-10 py-4 rounded-xl transition text-lg"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-slate-900/40 backdrop-blur-sm border-y border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Why Choose Tonfox Rooms?</h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-orange-400 to-red-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard icon="💸" title="Affordable Living" description="Clean and comfortable rooms at a budget-friendly price." />
              <FeatureCard icon="❄️" title="All Rooms Airconditioned" description="Every room is fully airconditioned for your comfort." />
              <FeatureCard icon="📍" title="Prime Location" description="Located near Cordova Town Square." />
              <FeatureCard icon="🛒" title="Close to Gaisano" description="Convenient distance from groceries and essentials." />
              <FeatureCard icon="🚶" title="Accessible Area" description="Near main roads and transport routes." />
              <FeatureCard icon="🏠" title="Simple & Peaceful" description="A safe and quiet place to rest." />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-12 shadow-2xl shadow-orange-500/20">
            <h2 className="text-4xl font-extrabold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 mb-10 max-w-lg mx-auto">
              Rent here at Tonfox Rooms and experience a relaxing stay. Your new home is just a click away.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-white text-orange-600 hover:bg-slate-100 font-bold px-10 py-4 rounded-xl transition transform hover:scale-105 active:scale-95 text-lg shadow-lg"
            >
              Login Now
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-950/80 border-t border-slate-800 py-12 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-slate-500 text-sm">&copy; 2026 Tonfox Rooms. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1">
      <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}