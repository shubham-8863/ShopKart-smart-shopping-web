import React from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/home/Hero';

function App() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#222222] font-sans antialiased flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  );
}

export default App;
