import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Link } from 'wouter';
import giftCardImg from '../assets/gift-card.png';
import { RefreshCcw, DollarSign, Clock, ShieldCheck } from 'lucide-react';

export default function GiftCards() {
  const brands = ['Amazon', 'Apple iTunes', 'Google Play', 'Steam', 'eBay', 'Walmart', 'Nike', 'Target', 'Razer Gold', 'Xbox', 'PlayStation', 'Roblox'];

  return (
    <Layout title="Gift Card Trading">
      {/* Hero */}
      <section className="pt-20 lg:pt-32 pb-20 overflow-hidden relative">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 relative"
            >
              <img src={giftCardImg} alt="Gift Card Trading" className="w-full max-w-lg mx-auto drop-shadow-2xl" />
            </motion.div>

            <div className="flex-1 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-semibold"
              >
                Instant Exchange
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-display font-bold leading-tight"
              >
                Turn unused cards <br/> into <span className="text-gradient-cyan">liquid cash.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/60 max-w-xl font-light"
              >
                Trade physical cards and e-codes for top dollar. Our automated system verifies and pays out instantly to your wallet.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/download">
                  <Button size="lg" className="rounded-full px-8 text-lg">Start Trading</Button>
                </Link>
                <Link href="/rates">
                  <Button variant="outline" size="lg" className="rounded-full px-8 text-lg border-white/20">Check Rates</Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Grid */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">We buy them all</h2>
            <p className="text-white/60">Over 50+ global gift card brands supported with the highest market rates.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map((brand, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl flex items-center justify-center text-center font-display font-bold text-white/80 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-default">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Processing</h3>
              <p className="text-white/60">No more waiting hours for verification. Our automated API checks card validity and credits your wallet in seconds.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Highest Rates</h3>
              <p className="text-white/60">We scan the global P2P markets to ensure we always offer you the most competitive payout rates available.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Zero Risk</h3>
              <p className="text-white/60">Trading directly with PayVora eliminates P2P scam risks. You deal with us, and we guarantee your payout.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
