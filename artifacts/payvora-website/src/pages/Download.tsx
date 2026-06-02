import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { SiApple, SiGoogleplay } from 'react-icons/si';
import qrCodeImg from '../assets/qr-code.png';
import { Star, ShieldCheck, Zap } from 'lucide-react';

export default function Download() {
  return (
    <Layout title="Download App">
      <section className="pt-24 lg:pt-32 pb-24 min-h-[90vh] flex flex-col justify-center">
        <div className="container mx-auto px-6">
          <div className="glass-panel max-w-5xl mx-auto rounded-[3rem] p-8 md:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center gap-16">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1072EA]/15 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#05305C]/20 blur-[150px] rounded-full pointer-events-none" />
            
            <div className="flex-1 relative z-10 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1072EA]/30 bg-[#1072EA]/10 text-[#1072EA] text-sm font-semibold mb-6"
              >
                Available iOS & Android
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-display font-bold mb-6"
              >
                Get the <span className="text-gradient-gold">PayVora</span> App.
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-white/60 mb-10 font-light"
              >
                Experience the ultimate command center for your digital wealth. Sign up takes less than 2 minutes.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12"
              >
                <a href="https://apps.apple.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  <div className="flex items-center justify-center gap-3 px-8 h-16 rounded-2xl bg-white text-[#0A1428] hover:bg-white/90 hover:scale-105 transition-all cursor-pointer shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                    <SiApple className="w-8 h-8" />
                    <div className="text-left">
                      <div className="text-xs font-semibold leading-none">Download on the</div>
                      <div className="text-xl font-bold leading-tight">App Store</div>
                    </div>
                  </div>
                </a>
                <a href="https://play.google.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  <div className="flex items-center justify-center gap-3 px-8 h-16 rounded-2xl bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:scale-105 transition-all cursor-pointer">
                    <SiGoogleplay className="w-7 h-7" />
                    <div className="text-left">
                      <div className="text-xs font-semibold leading-none text-white/70">GET IT ON</div>
                      <div className="text-xl font-bold leading-tight">Google Play</div>
                    </div>
                  </div>
                </a>
              </motion.div>

              <div className="flex items-center justify-center lg:justify-start gap-8 text-white/70">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-[#F8DF20] text-[#F8DF20]" />
                  <span className="font-bold">4.9/5</span> Rating
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  Secure
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Fast
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-1 max-w-sm w-full mx-auto relative z-10"
            >
              <div className="glass-panel p-8 rounded-[2rem] text-center border-white/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1072EA]/10 to-[#05305C]/10" />
                <h3 className="font-display font-bold text-xl mb-6 relative z-10">Scan to Download</h3>
                <div className="bg-white p-4 rounded-2xl relative z-10 mb-6">
                  <img src={qrCodeImg} alt="QR Code" className="w-full h-auto rounded-xl" />
                </div>
                <p className="text-sm text-white/60 relative z-10">Point your camera to download instantly</p>
              </div>
            </motion.div>

          </div>

          <div className="mt-16 text-center">
            <p className="text-white/40 mb-2 font-semibold tracking-widest text-sm uppercase">Desktop App</p>
            <h3 className="text-2xl font-display font-bold text-white/30">Coming Soon for macOS & Windows</h3>
          </div>
        </div>
      </section>
    </Layout>
  );
}
