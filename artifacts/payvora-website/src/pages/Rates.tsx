import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import ratesDashboardImg from '../assets/rates-dashboard.png';

export default function Rates() {
  const giftCardRates = [
    { brand: "Amazon US", type: "Physical", rate: "85%", value: "850/$1000", trend: "up" },
    { brand: "Amazon US", type: "E-Code", rate: "78%", value: "780/$1000", trend: "down" },
    { brand: "Apple iTunes", type: "Physical", rate: "82%", value: "820/$1000", trend: "up" },
    { brand: "Google Play", type: "Physical", rate: "75%", value: "750/$1000", trend: "same" },
    { brand: "Steam Wallet", type: "E-Code", rate: "80%", value: "800/$1000", trend: "up" },
    { brand: "eBay US", type: "Physical", rate: "72%", value: "720/$1000", trend: "down" },
  ];

  const cryptoRates = [
    { coin: "Bitcoin", symbol: "BTC", price: "$64,230.50", change: "+2.4%", up: true },
    { coin: "Ethereum", symbol: "ETH", price: "$3,450.20", change: "+1.8%", up: true },
    { coin: "Solana", symbol: "SOL", price: "$145.80", change: "-0.5%", up: false },
    { coin: "Binance Coin", symbol: "BNB", price: "$580.40", change: "+0.2%", up: true },
    { coin: "Cardano", symbol: "ADA", price: "$0.45", change: "-1.2%", up: false },
    { coin: "Ripple", symbol: "XRP", price: "$0.52", change: "+0.8%", up: true },
  ];

  return (
    <Layout title="Live Rates">
      <div className="container mx-auto px-6 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-semibold mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            Live Market Rates
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display font-bold mb-6"
          >
            Transparent pricing, <br/> <span className="text-gradient-cyan">zero surprises.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/60"
          >
            We aggregate the best rates globally to ensure you always get the maximum value for your assets.
          </motion.p>
        </div>

        <div className="mb-20 relative rounded-3xl overflow-hidden glass-panel border border-white/10 p-2 md:p-4">
          <img src={ratesDashboardImg} alt="Rates Dashboard" className="w-full rounded-2xl shadow-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1428] via-[#0A1428]/40 to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gift Card Rates */}
          <div className="glass-panel p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold">Gift Card Rates</h2>
              <TrendingUp className="text-cyan-400 w-6 h-6" />
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 text-xs text-white/40 uppercase tracking-wider font-semibold px-4 pb-2 border-b border-white/5">
                <div>Asset</div>
                <div className="text-center">Rate</div>
                <div className="text-right">Payout</div>
              </div>
              
              {giftCardRates.map((rate, i) => (
                <div key={i} className="grid grid-cols-3 items-center px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/5">
                  <div>
                    <div className="font-semibold text-white">{rate.brand}</div>
                    <div className="text-xs text-white/50">{rate.type}</div>
                  </div>
                  <div className="text-center font-bold text-cyan-400">{rate.rate}</div>
                  <div className="text-right font-medium">{rate.value}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Button variant="outline" className="w-full rounded-xl border-white/10 text-white/70">View All Brands</Button>
            </div>
          </div>

          {/* Crypto Rates */}
          <div className="glass-panel p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold">Crypto Prices</h2>
              <TrendingUp className="text-blue-400 w-6 h-6" />
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 text-xs text-white/40 uppercase tracking-wider font-semibold px-4 pb-2 border-b border-white/5">
                <div>Asset</div>
                <div className="text-right">Price</div>
                <div className="text-right">24h</div>
              </div>
              
              {cryptoRates.map((crypto, i) => (
                <div key={i} className="grid grid-cols-3 items-center px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/5">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-semibold text-white">{crypto.symbol}</div>
                      <div className="text-xs text-white/50">{crypto.coin}</div>
                    </div>
                  </div>
                  <div className="text-right font-medium">{crypto.price}</div>
                  <div className={`text-right flex items-center justify-end text-sm font-semibold ${crypto.up ? 'text-green-400' : 'text-red-400'}`}>
                    {crypto.up ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {crypto.change}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Button variant="outline" className="w-full rounded-xl border-white/10 text-white/70">Trade Crypto</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
