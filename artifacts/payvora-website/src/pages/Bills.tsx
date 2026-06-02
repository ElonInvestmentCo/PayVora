import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Link } from 'wouter';
import { Zap, Wifi, Tv, Droplet, Globe, Phone } from 'lucide-react';
import billsUiImg from '../assets/bills-ui.png';

export default function Bills() {
  const services = [
    { icon: <Phone className="w-6 h-6" />, name: "Airtime Top-up", color: "text-blue-400", bg: "bg-blue-500/20" },
    { icon: <Wifi className="w-6 h-6" />, name: "Internet Data", color: "text-green-400", bg: "bg-green-500/20" },
    { icon: <Zap className="w-6 h-6" />, name: "Electricity", color: "text-yellow-400", bg: "bg-yellow-500/20" },
    { icon: <Tv className="w-6 h-6" />, name: "Cable TV", color: "text-purple-400", bg: "bg-purple-500/20" },
    { icon: <Droplet className="w-6 h-6" />, name: "Water Utilities", color: "text-cyan-400", bg: "bg-cyan-500/20" },
    { icon: <Globe className="w-6 h-6" />, name: "Global eSIMs", color: "text-orange-400", bg: "bg-orange-500/20" },
  ];

  return (
    <Layout title="Bills & eSIMs">
      {/* Hero */}
      <section className="pt-20 lg:pt-32 pb-20 overflow-hidden relative">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm font-semibold"
              >
                Everyday Utilities
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-display font-bold leading-tight"
              >
                Pay bills without <br/> <span className="text-gradient">the friction.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/60 max-w-xl font-light"
              >
                Settle electricity, TV, internet, and top-up airtime directly from your PayVora balance. Plus, get instant eSIMs for global travel.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link href="/download">
                  <Button size="lg" className="rounded-full px-8 text-lg bg-indigo-600 hover:bg-indigo-500 text-white">Pay a Bill Now</Button>
                </Link>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 relative"
            >
              <img src={billsUiImg} alt="Bills App UI" className="w-full max-w-xs mx-auto rounded-[2.5rem] border-[6px] border-white/10 drop-shadow-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Everything in one place</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div key={i} className="glass-panel p-6 rounded-3xl flex flex-col items-center text-center group hover:bg-white/[0.05] transition-colors cursor-pointer">
                <div className={`w-16 h-16 rounded-2xl ${service.bg} ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="font-bold font-display">{service.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* eSIM feature */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="glass-panel rounded-3xl p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm font-semibold mb-6">
                Travel Connected
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Global eSIM Data</h2>
              <p className="text-xl text-white/60 mb-8 font-light">
                Traveling? Skip the airport kiosk. Buy an eSIM directly in the PayVora app for over 150+ countries. Scan the QR code and get online instantly.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Coverage in 150+ countries</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Instant QR code activation</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Pay with crypto or fiat</li>
              </ul>
              <Button className="rounded-full bg-orange-500 hover:bg-orange-400 text-black font-bold px-8">Explore Data Plans</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
