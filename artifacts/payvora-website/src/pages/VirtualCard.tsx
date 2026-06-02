import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Lock, Smartphone, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Link } from 'wouter';
import virtualCardImg from '../assets/virtual-card.png';

export default function VirtualCard() {
  return (
    <Layout title="Virtual Dollar Card">
      {/* Hero */}
      <section className="pt-20 lg:pt-32 pb-20 overflow-hidden relative">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-semibold"
              >
                Virtual Visa Card
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-display font-bold leading-tight"
              >
                Pay globally <br/> <span className="text-gradient">without limits.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/60 max-w-xl font-light"
              >
                Create a virtual USD card in seconds. Fund it directly with crypto or local currency and pay anywhere Visa is accepted.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link href="/download">
                  <Button size="lg" className="rounded-full px-8 text-lg">Create Your Card</Button>
                </Link>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1 }}
              className="flex-1 relative perspective-[1000px]"
            >
              <img src={virtualCardImg} alt="Virtual Visa Card" className="w-full max-w-md mx-auto drop-shadow-2xl" style={{ filter: 'drop-shadow(0 30px 40px rgba(168,85,247,0.3))' }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Ready in 60 seconds</h2>
            <p className="text-white/60">Skip the bank queues and paperwork. Get your card right now.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-px bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 -translate-y-1/2" />
            
            {[
              { step: "1", title: "Verify Identity", desc: "Complete a quick KYC check inside the app." },
              { step: "2", title: "Fund Wallet", desc: "Deposit local fiat or transfer crypto to your PayVora account." },
              { step: "3", title: "Generate Card", desc: "Tap 'Create Card', set your limits, and start spending instantly." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 glass-panel p-8 rounded-3xl text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center text-2xl font-bold font-display mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
              <div className="glass-panel p-6 rounded-3xl text-center flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1072EA]/15 text-[#1072EA] flex items-center justify-center"><Globe className="w-6 h-6" /></div>
                <div className="font-semibold">Netflix</div>
              </div>
              <div className="glass-panel p-6 rounded-3xl text-center flex flex-col items-center justify-center gap-4 mt-8">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center"><Globe className="w-6 h-6" /></div>
                <div className="font-semibold">AWS</div>
              </div>
              <div className="glass-panel p-6 rounded-3xl text-center flex flex-col items-center justify-center gap-4 -mt-8">
                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center"><Globe className="w-6 h-6" /></div>
                <div className="font-semibold">Spotify</div>
              </div>
              <div className="glass-panel p-6 rounded-3xl text-center flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center"><Globe className="w-6 h-6" /></div>
                <div className="font-semibold">Facebook Ads</div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Built for the digital economy.</h2>
              <p className="text-lg text-white/60 mb-8">Whether you are paying for server costs, running ads, or just chilling with Netflix, the PayVora card never gets declined.</p>
              
              <ul className="space-y-6">
                {[
                  { icon: <Lock />, title: "Instant freeze/unfreeze", desc: "Total control over your card security." },
                  { icon: <Globe />, title: "Universally accepted", desc: "Works on 99% of international checkout pages." },
                  { icon: <Smartphone />, title: "Direct crypto funding", desc: "No need to withdraw to a bank first." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/70">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-white/50">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
