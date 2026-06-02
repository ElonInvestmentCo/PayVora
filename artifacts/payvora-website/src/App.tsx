import React from 'react';
import { Route, Switch } from 'wouter';
import Home from './pages/Home';
import Features from './pages/Features';
import Rates from './pages/Rates';
import VirtualCard from './pages/VirtualCard';
import GiftCards from './pages/GiftCards';
import CryptoTrading from './pages/CryptoTrading';
import Bills from './pages/Bills';
import About from './pages/About';
import Contact from './pages/Contact';
import Download from './pages/Download';

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/features" component={Features} />
      <Route path="/rates" component={Rates} />
      <Route path="/virtual-card" component={VirtualCard} />
      <Route path="/gift-cards" component={GiftCards} />
      <Route path="/crypto" component={CryptoTrading} />
      <Route path="/bills" component={Bills} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/download" component={Download} />
      <Route>
        <div className="min-h-[100dvh] bg-[#0A1428] text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-display font-bold mb-4 text-[#1072EA]">404</h1>
            <p className="text-white/60">Page not found</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}
