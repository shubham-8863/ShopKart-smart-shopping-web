import React from 'react';
import Navbar from './components/layout/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-shop-bg">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-3xl font-semibold text-shop-text">
          ShopKart
        </h1>
      </main>
    </div>
  );
}

export default App;
