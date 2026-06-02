import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Bitcoin, CreditCard, Smartphone, Shield, BarChart, Trophy, Globe } from 'lucide-react';
import Layout from '../components/Layout';
import { Link } from 'wouter';
import { Button } from '../components/ui/button';

const FadeIn = ({ children, delay = 0, className }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Features() {
  const features = [
    {
      title: "Gift Card Trading",
      icon: <Gift className="w-8 h-8" />,
      desc: "Convert unused gift cards from 50+ global brands into cash or crypto instantly at market-leading rates.",
      color: "from-[#1072EA] to-[#0B5BC4]",
      bullets: ["Automated instant verification", "Highest payouts guaranteed", "24/7 automated processing"],
      link: "/gift-cards"
    },
    {
      title: "Crypto Trading",
      icon: <Bitcoin className="w-8 h-8" />,
      desc: "Buy, sell, and securely store top cryptocurrencies with deep liquidity and zero hidden fees.",
      color: "from-orange-400 to-yellow-500",
      bullets: ["Real-time market charts", "Low spread execution", "Cold storage security"],
      link: "/crypto"
    },
    {
      title: "Virtual Dollar Card",
      icon: <CreditCard className="w-8 h-8" />,
      desc: "Instantly issue virtual Visa cards for your online subscriptions, global shopping, and international payments.",
      color: "from-purple-500 to-pink-500",
      bullets: ["Accepted globally", "Fund with cash or crypto", "Instant freeze controls"],
      link: "/virtual-card"
    },
    {
      title: "Bills & eSIMs",
      icon: <Smartphone className="w-8 h-8" />,
      desc: "Settle utility bills effortlessly and stay connected globally with instant eSIM data packages for 150+ countries.",
      color: "from-indigo-500 to-blue-500",
      bullets: ["Zero-fee bill payments", "Instant eSIM delivery", "Local & international top-ups"],
      link: "/bills"
    },
    {
      title: "Multi-currency Wallet",
      icon: <Globe className="w-8 h-8" />,
      desc: "Manage your local currency and USD equivalents side-by-side seamlessly. Swap between fiat and crypto.",
      color: "from-emerald-400 to-teal-500",
      bullets: ["Unified portfolio view", "Instant internal swaps", "Transparent conversion rates"],
      link: "#"
    },
    {
      title: "Bank-Grade Security",
      icon: <Shield className="w-8 h-8" />,
      desc: "Sleep easy knowing your assets are protected by industry-leading security protocols and robust KYC.",
      color: "from-slate-400 to-slate-600",
      bullets: ["Biometric authentication", "Mandatory 2FA", "Automated AML tracking"],
      link: "#"
    },
    {
      title: "Leaderboard & Rewards",
      icon: <Trophy className="w-8 h-8" />,
      desc: "Earn points and climb the ranks as you trade. Top traders win exclusive monthly cash prizes and lower fees.",
      color: "from-amber-300 to-orange-400",
      bullets: ["Monthly prize pools", "Tiered fee discounts", "Referral bonuses"],
      link: "#"
    },
    {
      title: "Real-time Market Data",
      icon: <BarChart className="w-8 h-8" />,
      desc: "Make informed decisions with up-to-the-second market data, volume charts, and price alerts.",
      color: "from-[#F8DF20] to-[#1072EA]",
      bullets: ["Custom price alerts", "Historical data analysis", "Volume indicators"],
      link: "#"
    }
  ];

  return (
    <Layout title="Features">
      <div className="container mx-auto px-6 py-20 lg:py-32">
        <FadeIn className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">Power in your pocket.</h1>
          <p className="text-xl text-white/60 font-light">Explore the comprehensive suite of financial tools designed to help you pay smart and grow more.</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="glass-panel p-8 md:p-10 rounded-[2rem] h-full flex flex-col relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${feature.color} opacity-5 blur-[100px] group-hover:opacity-20 transition-opacity duration-500`} />
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-[1px] mb-8 relative z-10`}>
                  <div className="w-full h-full rounded-2xl bg-[#0A1428] flex items-center justify-center">
                    <div className={`bg-gradient-to-br ${feature.color} -webkit-background-clip-text text-transparent`}>
                      {React.cloneElement(feature.icon as React.ReactElement, { className: "w-8 h-8 stroke-[url(#grad)]" })}
                    </div>
                  </div>
                </div>

                <h3 className="text-3xl font-display font-bold mb-4 relative z-10">{feature.title}</h3>
                <p className="text-white/60 mb-8 relative z-10 text-lg leading-relaxed">{feature.desc}</p>
                
                <ul className="space-y-3 mb-8 flex-1 relative z-10">
                  {feature.bullets.map((bullet, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1072EA]" />
                      {bullet}
                    </li>
                  ))}
                </ul>

                {feature.link !== "#" && (
                  <Link href={feature.link} className="relative z-10">
                    <Button variant="outline" className="w-full rounded-xl border-white/10 hover:bg-white/5">
                      Explore Feature
                    </Button>
                  </Link>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
      
      {/* SVG gradients for icons */}
      <svg width="0" height="0">
        <linearGradient id="grad" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop stopColor="#F8DF20" offset="0%" />
          <stop stopColor="#1072EA" offset="100%" />
        </linearGradient>
      </svg>
    </Layout>
  );
}
