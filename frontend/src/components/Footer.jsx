import React from 'react';
import { Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] py-10 px-4 sm:px-6 lg:px-8 mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500 dark:text-slate-400">
        
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4 fill-white/20" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">InsurePredict</span>
          <span>— AI-Powered Health Insurance Cost Predictor</span>
        </div>

        <div className="flex items-center space-x-6 text-xs">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Home</Link>
          <Link to="/predictor" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Predictor</Link>
          <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Model Specs</Link>
          <Link to="/history" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Dashboard</Link>
        </div>

        <p className="text-xs text-center md:text-right max-w-md">
          Disclaimer: This tool provides an estimated insurance cost for educational/demo purposes.
          Actual insurance premiums may vary based on additional factors and insurer-specific underwriting.
        </p>
      </div>
    </footer>
  );
}
