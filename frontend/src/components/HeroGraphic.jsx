import React from 'react';
import { Activity, Users, Shield, Pill, Stethoscope, Heart } from 'lucide-react';

export default function HeroGraphic() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center select-none">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 via-teal-300/20 to-indigo-400/10 rounded-full blur-3xl -z-10 animate-pulse duration-1000" />

      {/* Decorative concentric background rings */}
      <div className="absolute w-[92%] h-[92%] rounded-full border border-blue-100/60 dark:border-blue-900/30 -z-10" />
      <div className="absolute w-[78%] h-[78%] rounded-full border border-blue-200/50 dark:border-blue-900/40 -z-10" />

      {/* Main 3D Illustration Container */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        
        {/* Floating Badge 1 - Top Left: Heartbeat / Pulse */}
        <div className="absolute -top-2 left-6 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl shadow-teal-500/10 border border-slate-100 dark:border-slate-700 animate-bounce [animation-duration:3.5s] z-20">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-500">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* Floating Badge 2 - Top Right: Family / Beneficiaries */}
        <div className="absolute top-4 -right-2 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl shadow-blue-500/10 border border-slate-100 dark:border-slate-700 animate-bounce [animation-duration:4s] z-20">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-500">
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* Floating Badge 3 - Bottom Left: Health Cover / Pill */}
        <div className="absolute bottom-6 left-2 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl shadow-indigo-500/10 border border-slate-100 dark:border-slate-700 animate-bounce [animation-duration:4.5s] z-20">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500">
            <Pill className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* Central Shield Graphic (SVG) */}
        <svg
          viewBox="0 0 320 320"
          className="w-full h-full drop-shadow-2xl overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer Shield Gradient */}
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            {/* Inner Shield Bevel */}
            <linearGradient id="shieldInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>

            {/* Gloss reflection */}
            <linearGradient id="glossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Stethoscope tube gradient */}
            <linearGradient id="tubeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0284c7" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Glowing back aura */}
          <circle cx="160" cy="150" r="110" fill="#38bdf8" opacity="0.15" filter="url(#softGlow)" />

          {/* Stethoscope Back Loop */}
          <path
            d="M 120 70 C 90 70 65 95 65 140 C 65 210 130 250 170 265 C 220 280 255 240 255 190 C 255 170 240 155 220 155"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
            strokeLinecap="round"
            className="dark:stroke-slate-700"
          />

          {/* Main Shield Body */}
          <path
            d="M 160 50 C 220 50 250 70 250 135 C 250 205 195 245 160 265 C 125 245 70 205 70 135 C 70 70 100 50 160 50 Z"
            fill="url(#shieldGrad)"
            filter="url(#softGlow)"
          />

          {/* Inner Inset Shield */}
          <path
            d="M 160 66 C 208 66 232 82 232 135 C 232 195 188 230 160 246 C 132 230 88 195 88 135 C 88 82 112 66 160 66 Z"
            fill="url(#shieldInnerGrad)"
          />

          {/* Shield Gloss Specular */}
          <path
            d="M 160 68 C 190 68 220 80 226 120 C 180 130 140 180 130 230 C 100 205 90 170 90 135 C 90 85 125 68 160 68 Z"
            fill="url(#glossGrad)"
          />

          {/* Medical Cross (White 3D) */}
          <g transform="translate(160, 142)">
            {/* Horizontal Bar */}
            <rect
              x="-36"
              y="-12"
              width="72"
              height="24"
              rx="6"
              fill="#ffffff"
              filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))"
            />
            {/* Vertical Bar */}
            <rect
              x="-12"
              y="-36"
              width="24"
              height="72"
              rx="6"
              fill="#ffffff"
              filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))"
            />
          </g>

          {/* Stethoscope Front Drum / Head */}
          <g transform="translate(250, 195)">
            <circle cx="0" cy="0" r="18" fill="#475569" />
            <circle cx="0" cy="0" r="14" fill="#94a3b8" />
            <circle cx="0" cy="0" r="10" fill="#f8fafc" />
            <circle cx="0" cy="0" r="4" fill="#0284c7" />
          </g>

          {/* Stethoscope Binaural Earpieces */}
          <path
            d="M 105 75 Q 115 50 130 45"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="132" cy="45" r="4.5" fill="#0284c7" />

          <path
            d="M 215 75 Q 205 50 190 45"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="188" cy="45" r="4.5" fill="#0284c7" />
        </svg>

      </div>
    </div>
  );
}
