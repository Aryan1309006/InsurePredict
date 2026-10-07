import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Predictor from './pages/Predictor';
import Result from './pages/Result';
import History from './pages/History';
import About from './pages/About';

function App() {
  const [lastResult, setLastResult] = useState(null);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 transition-colors duration-200">
          <Navbar />
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/predictor" 
                element={<Predictor setLastResult={setLastResult} />} 
              />
              <Route 
                path="/result" 
                element={<Result lastResult={lastResult} />} 
              />
              <Route path="/history" element={<History />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
