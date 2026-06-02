import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Mail, MessageCircle, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <Layout title="Contact Us">
      <section className="pt-24 lg:pt-32 pb-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-display font-bold mb-6"
            >
              Get in <span className="text-gradient-gold">touch.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/60 font-light"
            >
              Have a question, feedback, or need help with a transaction? Our support team is available 24/7.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="glass-panel p-8 rounded-3xl">
                <div className="w-12 h-12 rounded-xl bg-[#1072EA]/15 text-[#1072EA] flex items-center justify-center mb-6">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Email Support</h3>
                <p className="text-white/60 mb-4 text-sm">We aim to respond to all inquiries within 2 hours.</p>
                <a href="mailto:support@payvora.com" className="font-semibold text-[#1072EA] hover:underline">support@payvora.com</a>
              </div>

              <div className="glass-panel p-8 rounded-3xl">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Live Chat</h3>
                <p className="text-white/60 mb-4 text-sm">Available directly inside the PayVora app for verified users.</p>
                <span className="font-semibold text-white/40">In-app only</span>
              </div>

              <div className="glass-panel p-8 rounded-3xl">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Global HQ</h3>
                <p className="text-white/60 text-sm">
                  PayVora Technologies Ltd.<br/>
                  Lekki Phase 1,<br/>
                  Lagos, Nigeria
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#1072EA]/08 blur-[100px] rounded-full pointer-events-none" />
              
              <h2 className="text-3xl font-display font-bold mb-8 relative z-10">Send a message</h2>
              
              <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#1072EA] focus:ring-1 focus:ring-[#1072EA] transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#1072EA] focus:ring-1 focus:ring-[#1072EA] transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/70">Subject</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#1072EA] focus:ring-1 focus:ring-[#1072EA] transition-all"
                    placeholder="How can we help?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/70">Message</label>
                  <textarea 
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#1072EA] focus:ring-1 focus:ring-[#1072EA] transition-all resize-none"
                    placeholder="Describe your issue in detail..."
                  ></textarea>
                </div>

                <Button size="lg" className="w-full rounded-xl" type="submit">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
