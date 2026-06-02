import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Link } from 'wouter';
import cryptoImg from '../assets/crypto-trading.png';
import { Bitcoin, LineChart, Lock, Zap } from 'lucide-react';

export default function CryptoTrading() {
  const coins = [
    { name: 'Bitcoin', symbol: 'BTC', color: 'text-orange-400' },
    { name: 'Ethereum', symbol: 'ETH', color: 'text-blue-400' },
    { name: 'Solana', symbol: 'SOL', color: 'text-purple-400' },
    { name: 'Binance', symbol: 'BNB', color: 'text-yellow-400' },
    { name: 'Cardano', symbol: 'ADA', color: 'text-blue-400' },
    { name: 'Ripple', symbol: 'XRP', color: 'text-gray-300' }
  ];

  return (
    <Layout title="Crypto Trading">
      {/* Hero */}
      <section className="pt-20 lg:pt-32 pb-20 overflow-hidden relative">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-semibold"
              >
                <Bitcoin className="w-4 h-4" />
                Crypto Exchange
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-display font-bold leading-tight"
              >
                Next-gen crypto, <br/> <span className="text-gradient">simplified.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/60 max-w-xl font-light"
              >
                Buy, sell, and hold top-tier digital assets. Enjoy deep liquidity, zero-fee fiat deposits, and beautiful charting tools.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link href="/download">
                  <Button size="lg" className="rounded-full px-8 text-lg bg-blue-600 hover:bg-blue-500 text-white glow-blue">Trade Now</Button>
                </Link>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 relative"
            >
              <img src={cryptoImg} alt="Crypto Trading" className="w-full max-w-lg mx-auto drop-shadow-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Coins */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {coins.map((coin, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold ${coin.color}`}>
                  {coin.symbol[0]}
                </div>
                <div>
                  <div className="font-bold text-white">{coin.symbol}</div>
                  <div className="text-xs text-white/50">{coin.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Pro features, beginner friendly</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Execution</h3>
              <p className="text-white/60">Our matching engine executes trades in &lt;50ms, ensuring you never miss a market move.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cold Storage</h3>
              <p className="text-white/60">98% of user funds are kept safely offline in multi-sig cold wallets for ultimate peace of mind.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Charts</h3>
              <p className="text-white/60">Track your portfolio with beautiful, interactive charts. Set price alerts and limit orders easily.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
