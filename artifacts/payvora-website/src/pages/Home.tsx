import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Wallet, Smartphone, Shield, Zap, CheckCircle2, ChevronRight, Star } from 'lucide-react';
import { SiApple, SiGoogleplay } from 'react-icons/si';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { Link } from 'wouter';

import heroImg from "../assets/hero-app.png";
import virtualCardImg from "../assets/virtual-card.png";
import cryptoImg from "../assets/crypto-trading.png";
import giftCardImg from "../assets/gift-card.png";

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

export default function Home() {
  return (
    <Layout title="Home">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#1072EA] rounded-full blur-[150px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#05305C] rounded-full blur-[150px] opacity-20 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#F8DF20] animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wider text-[#F8DF20] uppercase">Pay Smart. Grow More.</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter leading-[1.1] mb-6 max-w-5xl"
          >
            The Command Center <br className="hidden md:block"/> for Your <span className="text-gradient-gold">Money.</span>
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
            <a href="https://apps.apple.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg rounded-full px-8 bg-white text-[#0A1428] hover:bg-white/90">
                <SiApple className="mr-2 w-5 h-5" />
                App Store
              </Button>
            </a>
            <a href="https://play.google.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-lg rounded-full px-8 bg-white/5 border-white/10 hover:bg-white/10">
                <SiGoogleplay className="mr-2 w-5 h-5" />
                Google Play
              </Button>
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 relative w-full max-w-5xl mx-auto perspective-[2000px]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1428] via-transparent to-transparent z-10 pointer-events-none" />
            <img 
              src={heroImg} 
              alt="PayVora App Interface" 
              className="w-full h-auto object-contain rounded-t-[40px] border border-white/10 shadow-[0_-20px_80px_rgba(16,114,234,0.3)] transform rotate-x-[5deg] translate-y-10" 
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

      {/* Feature Grids */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Everything you need.</h2>
            <p className="text-white/60">Manage your digital life, built right into one unified app.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/gift-cards">
              <FadeIn delay={0.1} className="glass-panel p-8 rounded-3xl h-full relative overflow-hidden group cursor-pointer hover:border-[#1072EA]/30 transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1072EA]/10 blur-[80px] rounded-full group-hover:bg-[#1072EA]/20 transition-colors duration-500" />
                <h3 className="text-2xl font-bold mb-3 font-display">Gift Card Trading</h3>
                <p className="text-white/60 mb-6">Trade your unused gift cards instantly for cash or crypto at industry-leading rates.</p>
                <img src={giftCardImg} alt="Gift Cards" className="w-full h-48 object-contain object-right-bottom opacity-80 group-hover:opacity-100 transition-opacity" />
              </FadeIn>
            </Link>

            <Link href="/crypto">
              <FadeIn delay={0.2} className="glass-panel p-8 rounded-3xl h-full relative overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-500" />
                <h3 className="text-2xl font-bold mb-3 font-display">Crypto Trading</h3>
                <p className="text-white/60 mb-6">Buy, sell, and hold top cryptocurrencies with deep liquidity and top security.</p>
                <img src={cryptoImg} alt="Crypto" className="w-full h-48 object-contain object-right-bottom opacity-80 group-hover:opacity-100 transition-opacity" />
              </FadeIn>
            </Link>

            <Link href="/virtual-card">
              <FadeIn delay={0.3} className="glass-panel p-8 rounded-3xl h-full relative overflow-hidden group cursor-pointer hover:border-purple-500/30 transition-colors">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-colors duration-500" />
                <h3 className="text-2xl font-bold mb-3 font-display">Virtual Dollar Card</h3>
                <p className="text-white/60 mb-6">Create a virtual Visa card in seconds to pay for subscriptions and global services.</p>
                <img src={virtualCardImg} alt="Virtual Card" className="w-full h-48 object-contain object-right-bottom opacity-80 group-hover:opacity-100 transition-opacity" />
              </FadeIn>
            </Link>

            <Link href="/bills">
              <FadeIn delay={0.4} className="glass-panel p-8 rounded-3xl h-full relative overflow-hidden group cursor-pointer hover:border-indigo-500/30 transition-colors">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors duration-500" />
                <h3 className="text-2xl font-bold mb-3 font-display">Bills & eSIMs</h3>
                <p className="text-white/60 mb-6">Pay utility bills and purchase global eSIM data instantly from your balance.</p>
                <div className="flex items-center justify-center h-48">
                  <Smartphone className="w-32 h-32 text-indigo-400/50 group-hover:text-indigo-400 transition-colors" />
                </div>
              </FadeIn>
            </Link>
          </div>
        </div>
      </section>

      {/* Why PayVora */}
      <section className="py-24 border-t border-white/5 relative bg-[#050a14]/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Why choose PayVora?</h2>
                <p className="text-lg text-white/60 mb-8">We combine the speed of crypto with the reliability of traditional finance to give you an unparalleled financial experience.</p>
                
                <div className="space-y-6">
                  {[
                    { title: "Lightning Fast", desc: "Transactions settle in milliseconds, not days." },
                    { title: "Best Rates Guaranteed", desc: "Our aggregation engine finds you the absolute best prices." },
                    { title: "Bank-Grade Security", desc: "End-to-end encryption and advanced fraud protection." },
                    { title: "Global Reach", desc: "Access financial services no matter where you live." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1072EA]/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-[#1072EA]" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold font-display text-white mb-1">{item.title}</h4>
                        <p className="text-white/60">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
            <div className="relative">
              <FadeIn direction="left">
                <div className="glass-panel p-8 rounded-3xl relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
                  <h3 className="text-2xl font-display font-bold mb-6 relative z-10">Trusted & Secure</h3>
                  <div className="space-y-4 relative z-10">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                      <Shield className="w-8 h-8 text-green-400" />
                      <div>
                        <div className="font-bold">256-bit Encryption</div>
                        <div className="text-sm text-white/50">Your data is safe</div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                      <Wallet className="w-8 h-8 text-blue-400" />
                      <div>
                        <div className="font-bold">Cold Storage</div>
                        <div className="text-sm text-white/50">Assets kept offline</div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                      <Zap className="w-8 h-8 text-purple-400" />
                      <div>
                        <div className="font-bold">Real-time Audits</div>
                        <div className="text-sm text-white/50">Continuous monitoring</div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Loved by thousands.</h2>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { text: "The virtual card feature is a lifesaver. I can finally pay for my global subscriptions without any hassle.", name: "Sarah J.", role: "Freelancer", initial: "S" },
              { text: "Best gift card rates I've found. Instant payout means I don't have to wait for my money.", name: "Michael T.", role: "Trader", initial: "M" },
              { text: "Having crypto, fiat, and bills in one app is incredibly convenient. The UI is gorgeous too.", name: "David O.", role: "Entrepreneur", initial: "D" }
            ].map((review, i) => (
              <FadeIn key={i} delay={i * 0.1} className="glass-panel p-8 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-[#F8DF20] text-[#F8DF20]" />)}
                  </div>
                  <p className="text-lg text-white/80 mb-6 italic">"{review.text}"</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1072EA]/20 text-[#1072EA] flex items-center justify-center font-bold font-display">
                    {review.initial}
                  </div>
                  <div>
                    <div className="font-bold text-white">{review.name}</div>
                    <div className="text-sm text-white/40">{review.role}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <FadeIn>
            <div className="glass-panel border-[#1072EA]/30 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#1072EA]/20 to-transparent pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1072EA]/15 blur-[150px] rounded-full pointer-events-none" />
              
              <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 relative z-10">
                Ready to take control?
              </h2>
              <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto font-light relative z-10">
                Join thousands of users who have upgraded their financial life with PayVora. Setup takes less than 2 minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <a href="https://apps.apple.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full text-lg rounded-full px-8 h-14 bg-white text-[#0A1428] hover:bg-white/90 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]">
                    <SiApple className="mr-2 w-6 h-6" />
                    App Store
                  </Button>
                </a>
                <a href="https://play.google.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full text-lg rounded-full px-8 h-14 bg-[#0A1428] border-white/20 hover:bg-white/10 text-white hover:scale-105 transition-all">
                    <SiGoogleplay className="mr-2 w-5 h-5" />
                    Google Play
                  </Button>
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </Layout>
  );
}
