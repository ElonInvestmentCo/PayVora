import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import team1Img from '../assets/team-1.png';
import team2Img from '../assets/team-2.png';
import team3Img from '../assets/team-3.png';

export default function About() {
  const stats = [
    { label: "Active Users", value: "250K+" },
    { label: "Countries Supported", value: "150+" },
    { label: "Processed Volume", value: "$500M+" },
    { label: "Uptime", value: "99.99%" },
  ];

  const team = [
    { name: "Michael Chen", role: "Chief Executive Officer", img: team1Img },
    { name: "Sarah Jenkins", role: "Chief Technology Officer", img: team2Img },
    { name: "David Okonkwo", role: "Head of Product Design", img: team3Img },
  ];

  return (
    <Layout title="About Us">
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-20 text-center relative">
        <div className="container mx-auto px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-bold mb-8"
          >
            Democratizing finance <br/> <span className="text-gradient-cyan">for everyone.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed"
          >
            PayVora was built on a simple belief: accessing the global digital economy shouldn't be hard. We are tearing down financial borders.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-display font-bold text-cyan-400 mb-2">{stat.value}</div>
                <div className="text-sm text-white/50 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Our Core Values</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-10 rounded-3xl">
              <div className="text-xl font-bold font-display text-cyan-400 mb-4">01. Speed</div>
              <p className="text-white/70 text-lg leading-relaxed">Time is money. We build systems that execute instantly. No artificial delays, no slow approvals. If it can be automated safely, it is.</p>
            </div>
            <div className="glass-panel p-10 rounded-3xl">
              <div className="text-xl font-bold font-display text-blue-400 mb-4">02. Security</div>
              <p className="text-white/70 text-lg leading-relaxed">Trust is our currency. We employ bank-grade encryption, cold storage, and rigorous compliance to protect user assets at all costs.</p>
            </div>
            <div className="glass-panel p-10 rounded-3xl">
              <div className="text-xl font-bold font-display text-purple-400 mb-4">03. Simplicity</div>
              <p className="text-white/70 text-lg leading-relaxed">Finance is complicated enough. Our interfaces abstract away the complexity of blockchains and legacy banking routing.</p>
            </div>
            <div className="glass-panel p-10 rounded-3xl">
              <div className="text-xl font-bold font-display text-orange-400 mb-4">04. Scale</div>
              <p className="text-white/70 text-lg leading-relaxed">We build for a global audience from day one. Our infrastructure is designed to handle millions of transactions across borders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-[#050a14]/50 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Meet the Team</h2>
            <p className="text-white/60">Built by veterans from traditional finance, top-tier crypto exchanges, and leading tech companies.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div key={i} className="text-center">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 border-4 border-white/10">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold font-display text-white mb-1">{member.name}</h3>
                <p className="text-cyan-400 text-sm font-semibold">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
