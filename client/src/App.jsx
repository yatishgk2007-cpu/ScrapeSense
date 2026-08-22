import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Overview from './pages/Overview';
import HealingCenter from './pages/HealingCenter';

import Competitors from './pages/Competitors';
import Comparison from './pages/Comparison';
import History from './pages/History';
import Health from './pages/Health';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-background text-white overflow-hidden selection:bg-primary-500/30">
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/history" element={<History />} />
            <Route path="/health" element={<Health />} />
            <Route path="/healing-center" element={<HealingCenter />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
