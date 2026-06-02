import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ChevronRight, ArrowRight, Wallet, Smartphone, Shield, Globe, Bitcoin, CreditCard, Zap, Download, RefreshCcw, Lock, ChevronDown, CheckCircle2 } from 'lucide-react';
import { cn } from './lib/utils';
import { Button } from './components/ui/button';

import heroImg from "./assets/hero-app.png";
import virtualCardImg from "./assets/virtual-card.png";
import cryptoImg from "./assets/crypto-trading.png";
import giftCardImg from "./assets/gift-card.png";
import logoImg from "../../giftcard-trader/assets/images/icon.png";

const FadeIn = ({ children, delay = 0, className, direction = "up" }: { children: React.ReactNode, delay?: number, className?: string, direction?: "up" | "left" | "right" }) => {
  const y = direction === "up" ? 30 : 0;
  const x = direction === "left" ? -30 : direction === "right" ? 30 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function App() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="relative min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="noise-bg" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 border-white/5 py-4 px-6 md:px-12 flex items-center justify-between transition-all duration-300 bg-[#0A1428]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0C38C0] to-[#00C4F4] p-[1px] glow-blue">
            <div className="w-full h-full rounded-xl bg-[#0A1428] flex items-center justify-center overflow-hidden">
              <img src={logoImg} alt="PayVora Logo" className="w-8 h-8 object-contain" />
            </div>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">PayVora</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-medium text-sm text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#crypto" className="hover:text-white transition-colors">Crypto</a>
          <a href="#card" className="hover:text-white transition-colors">Virtual Card</a>
          <a href="#company" className="hover:text-white transition-colors">Company</a>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
          <Button className="group rounded-full px-6">
            Get App <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        <div className="grid-bg" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#1254EC] rounded-full blur-[150px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#00C4F4] rounded-full blur-[150px] opacity-20 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">Pay Smart. Grow More.</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter leading-[1.1] mb-6 max-w-5xl"
          >
            The Command Center <br className="hidden md:block"/> for Your <span className="text-gradient-cyan">Money.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl font-light"
          >
            Trade gift cards instantly. Buy and sell crypto without limits. Get a virtual dollar card that works globally. All in one powerful app.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Button size="lg" className="w-full sm:w-auto text-lg rounded-full px-10 group">
              Download PayVora
              <Download className="ml-2 w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg rounded-full px-10 bg-white/5 border-white/10 hover:bg-white/10">
              View Rates
            </Button>
          </motion.div>

          <motion.div 
            style={{ y: heroY, opacity }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 relative w-full max-w-5xl mx-auto perspective-[2000px]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1428] via-transparent to-transparent z-10 pointer-events-none" />
            <img 
              src={heroImg} 
              alt="PayVora App Interface" 
              className="w-full h-auto object-contain rounded-t-[40px] border border-white/10 shadow-[0_-20px_80px_rgba(12,56,192,0.3)] transform rotate-x-[5deg] translate-y-10" 
            />
          </motion.div>
        </div>
      </section>

      {/* Partners / Supported Assets */}
      <section className="py-10 border-y border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm font-medium text-white/40 mb-6 uppercase tracking-widest">Supported globally</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Bitcoin', 'Ethereum', 'Solana', 'Visa', 'Mastercard', 'Amazon', 'Apple'].map((partner, i) => (
              <div key={i} className="text-xl font-display font-bold">{partner}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature 1: Gift Cards */}
      <section id="features" className="py-24 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="flex-1 space-y-8">
              <FadeIn direction="left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1254EC]/20 text-[#1254EC] border border-[#1254EC]/30 text-sm font-semibold mb-2">
                  <RefreshCcw className="w-4 h-4" />
                  <span>Instant Exchange</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white mb-6">
                  Turn unused cards into <span className="text-gradient-cyan">liquid cash.</span>
                </h2>
                <p className="text-lg text-white/60 mb-8 font-light">
                  Got an Amazon or iTunes gift card you don't need? Trade it instantly for cash or crypto at industry-leading rates. No waiting, no hidden fees.
                </p>
                <ul className="space-y-4 mb-8">
                  {['Support for 50+ global brands', 'Highest market rates guaranteed', 'Instant payout to your wallet', '24/7 automated processing'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-cyan-400 shrink-0" />
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="primary" className="rounded-full px-8">Start Trading</Button>
              </FadeIn>
            </div>
            <div className="flex-1 relative w-full">
              <FadeIn direction="right" className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full" />
                <img src={giftCardImg} alt="Gift Card Trading" className="relative z-10 w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Crypto */}
      <section id="crypto" className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-[#0A1428] to-[#0a0f1d]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col-reverse md:flex-row items-center gap-16 md:gap-24">
            <div className="flex-1 relative w-full">
              <FadeIn direction="left" className="relative">
                <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full" />
                <img src={cryptoImg} alt="Crypto Trading Interface" className="relative z-10 w-full h-auto object-contain drop-shadow-2xl hover:-translate-y-4 transition-transform duration-700" />
              </FadeIn>
            </div>
            <div className="flex-1 space-y-8">
              <FadeIn direction="right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm font-semibold mb-2">
                  <Bitcoin className="w-4 h-4" />
                  <span>Crypto Assets</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white mb-6">
                  Next-gen crypto trading, <span className="text-gradient">simplified.</span>
                </h2>
                <p className="text-lg text-white/60 mb-8 font-light">
                  Buy, sell, and hold BTC, ETH, SOL, and more with zero friction. Beautiful charts, deep liquidity, and institutional-grade security.
                </p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="glass-panel p-5 rounded-2xl">
                    <h4 className="text-2xl font-bold text-white mb-1">0%</h4>
                    <p className="text-sm text-white/50">Maker fees on first $1k</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl">
                    <h4 className="text-2xl font-bold text-white mb-1">&lt;50ms</h4>
                    <p className="text-sm text-white/50">Trade execution time</p>
                  </div>
                </div>
                <Button className="rounded-full px-8">Explore Markets</Button>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Virtual Card */}
      <section id="card" className="py-24 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="flex-1 space-y-8">
              <FadeIn direction="left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C38C0]/30 text-blue-300 border border-[#0C38C0]/50 text-sm font-semibold mb-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Global Spending</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white mb-6">
                  Your global <span className="text-gradient-cyan">dollar card.</span>
                </h2>
                <p className="text-lg text-white/60 mb-8 font-light">
                  Create a virtual Visa card in seconds. Fund it directly from your crypto or cash balance and pay anywhere online—from Netflix to AWS.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <Globe className="w-5 h-5 text-white/70" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Accepted worldwide</h4>
                      <p className="text-sm text-white/50">Pay anywhere Visa is accepted online.</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <Lock className="w-5 h-5 text-white/70" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Advanced security</h4>
                      <p className="text-sm text-white/50">Freeze, unfreeze, and set limits instantly.</p>
                    </div>
                  </li>
                </ul>
                <Button variant="outline" className="rounded-full px-8 border-white/20">Get Your Card</Button>
              </FadeIn>
            </div>
            <div className="flex-1 relative w-full flex justify-center">
              <FadeIn direction="right" className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-[#00C4F4]/20 blur-[100px] rounded-full" />
                <img src={virtualCardImg} alt="Virtual Visa Card" className="relative z-10 w-full h-auto object-contain animate-float" style={{ animation: 'float 6s ease-in-out infinite' }} />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">More than just a wallet.</h2>
            <p className="text-white/60">Everything you need to manage your digital life, built right in.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeIn delay={0.1} className="glass-panel p-8 rounded-3xl col-span-1 md:col-span-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-colors duration-500" />
              <Zap className="w-10 h-10 text-cyan-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3 font-display">Pay Bills Instantly</h3>
              <p className="text-white/60 max-w-md">Settle your electricity, internet, and cable bills directly from your balance with zero delays.</p>
            </FadeIn>
            
            <FadeIn delay={0.2} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-500" />
              <Smartphone className="w-10 h-10 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3 font-display">Global eSIMs</h3>
              <p className="text-white/60">Buy data packages for 150+ countries. Stay connected everywhere.</p>
            </FadeIn>
            
            <FadeIn delay={0.3} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-colors duration-500" />
              <Shield className="w-10 h-10 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3 font-display">Bank-grade Security</h3>
              <p className="text-white/60">Biometric auth, 2FA, and cold storage for your assets.</p>
            </FadeIn>

            <FadeIn delay={0.4} className="glass-panel p-8 rounded-3xl col-span-1 md:col-span-2 relative overflow-hidden group">
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors duration-500" />
               <Wallet className="w-10 h-10 text-indigo-400 mb-6" />
               <h3 className="text-2xl font-bold mb-3 font-display">Unified Portfolio</h3>
               <p className="text-white/60 max-w-md">Track your crypto, cash, and card balances in one beautiful, cohesive dashboard.</p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <FadeIn>
            <div className="glass-panel border-cyan-500/30 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#0C38C0]/20 to-transparent pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/20 blur-[150px] rounded-full pointer-events-none" />
              
              <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 relative z-10">
                Ready to take control?
              </h2>
              <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto font-light relative z-10">
                Join thousands of users who have upgraded their financial life with PayVora. Setup takes less than 2 minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Button size="lg" className="w-full sm:w-auto text-lg rounded-full px-10 h-14 bg-white text-[#0A1428] hover:bg-white/90 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]">
                  Download App Now
                </Button>
                <p className="text-sm text-white/40 mt-4 sm:mt-0 sm:ml-4">Available on iOS & Android</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050a14] pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0C38C0] to-[#00C4F4] p-[1px]">
                  <div className="w-full h-full rounded-lg bg-[#0A1428] flex items-center justify-center">
                    <img src={logoImg} alt="PayVora Logo" className="w-5 h-5 object-contain" />
                  </div>
                </div>
                <span className="font-display font-bold text-lg tracking-tight text-white">PayVora</span>
              </div>
              <p className="text-sm text-white/50 mb-6">
                PAY SMART. GROW MORE.<br/>
                The ultimate command center for your digital wealth.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Products</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Gift Cards</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Crypto Trading</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Virtual Card</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Pay Bills</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">AML Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} PayVora Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span>System Status: <span className="text-green-400">All systems operational</span></span>
            </div>
          </div>
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}} />
    </div>
  );
}