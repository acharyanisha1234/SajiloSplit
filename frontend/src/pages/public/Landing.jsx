import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wallet, Users, Shield, PieChart, Lock, Zap } from 'lucide-react';

const Landing = () => {
  const features = [
    { icon: Wallet, title: 'Digital Wallet', description: 'Manage your money securely with a modern digital wallet' },
    { icon: Users, title: 'Group Wallet', description: 'Create groups and manage shared expenses effortlessly' },
    { icon: Shield, title: 'Smart Settlements', description: 'Automatic settlement calculations for group expenses' },
    { icon: PieChart, title: 'Budget Tracking', description: 'Track your spending and stay within your budget' },
    { icon: Lock, title: 'Locked Funds', description: 'Lock money for specific purposes and goals' },
    { icon: Zap, title: 'Instant Transfers', description: 'Send and receive money instantly' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">SajiloSplit</h1>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Smart Money Management
            <span className="text-primary-600"> Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            SajiloSplit is your all-in-one platform for managing personal finances, 
            group expenses, and shared budgets with ease.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-outline text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need in One Place
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center bg-primary-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
          <p className="text-lg mb-8 text-primary-100">
            Join thousands of users already managing their money smarter with SajiloSplit.
          </p>
          <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Start Now - It's Free
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            © 2024 SajiloSplit. All rights reserved. Built with ❤️ in Nepal.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            This is a simulated fintech application for educational purposes.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;