import React from 'react';
import { Link } from 'wouter';
import { SiX, SiInstagram, SiTelegram } from 'react-icons/si';
import { Linkedin } from 'lucide-react';
import logoImg from "../../../giftcard-trader/assets/images/icon.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-[#050a14] pt-20 pb-10" data-testid="footer">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1072EA] to-[#05305C] p-[1px]">
                <div className="w-full h-full rounded-lg bg-[#0A1428] flex items-center justify-center">
                  <img src={logoImg} alt="PayVora Logo" className="w-5 h-5 object-contain" />
                </div>
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">PayVora</span>
            </div>
            <p className="text-sm text-white/50 mb-6 font-light leading-relaxed">
              PAY SMART. GROW MORE.<br/>
              The ultimate command center for your digital wealth.
            </p>
            <div className="flex items-center gap-4 text-white/40">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#1072EA] transition-colors">
                <SiX className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#1072EA] transition-colors">
                <SiInstagram className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#1072EA] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://telegram.org" target="_blank" rel="noreferrer" className="hover:text-[#1072EA] transition-colors">
                <SiTelegram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Products</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li><Link href="/gift-cards" className="hover:text-[#1072EA] transition-colors">Gift Cards</Link></li>
              <li><Link href="/crypto" className="hover:text-[#1072EA] transition-colors">Crypto Trading</Link></li>
              <li><Link href="/virtual-card" className="hover:text-[#1072EA] transition-colors">Virtual Card</Link></li>
              <li><Link href="/bills" className="hover:text-[#1072EA] transition-colors">Bills & eSIMs</Link></li>
              <li><Link href="/download" className="hover:text-[#1072EA] transition-colors">Download App</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li><Link href="/about" className="hover:text-[#1072EA] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#1072EA] transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-[#1072EA] transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-[#1072EA] transition-colors">Careers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li><Link href="#" className="hover:text-[#1072EA] transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-[#1072EA] transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-[#1072EA] transition-colors">AML Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {currentYear} PayVora Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>System Status: <span className="text-green-400">All systems operational</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
