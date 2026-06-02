import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import logoImg from "../../../giftcard-trader/assets/images/icon.png";

export default function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Rates', href: '/rates' },
    { name: 'Virtual Card', href: '/virtual-card' },
    { name: 'Gift Cards', href: '/gift-cards' },
    { name: 'Crypto', href: '/crypto' },
    { name: 'Bills & eSIMs', href: '/bills' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
          scrolled ? "bg-[#0A1428]/80 backdrop-blur-md border-white/5 py-3" : "bg-transparent border-transparent py-5"
        )}
        data-testid="navbar"
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 relative z-50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1072EA] to-[#05305C] p-[1px] glow-primary">
              <div className="w-full h-full rounded-xl bg-[#0A1428] flex items-center justify-center overflow-hidden">
                <img src={logoImg} alt="PayVora Logo" className="w-8 h-8 object-contain" />
              </div>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">PayVora</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-6 font-medium text-sm">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "relative py-2 transition-colors hover:text-white",
                  location === link.href ? "text-[#1072EA]" : "text-white/70"
                )}
              >
                {link.name}
                {location === link.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1072EA] rounded-full" />
                )}
              </Link>
            ))}
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/download" className="group" data-testid="nav-download-btn">
              <Button className="rounded-full px-6 bg-[#1072EA] hover:bg-[#0B5BC4] text-white">
                Download App <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <button 
            className="lg:hidden relative z-50 text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="mobile-menu-btn"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-[#0A1428]/95 backdrop-blur-xl transition-transform duration-500 lg:hidden flex flex-col justify-center items-center",
          isOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="flex flex-col items-center gap-6 text-xl font-display w-full px-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "transition-colors hover:text-[#1072EA] py-2",
                location === link.href ? "text-[#1072EA] font-bold" : "text-white"
              )}
            >
              {link.name}
            </Link>
          ))}
          <div className="w-full max-w-sm h-px bg-white/10 my-4" />
          <Link href="/download" className="w-full max-w-sm">
            <Button size="lg" className="w-full rounded-full bg-[#1072EA] hover:bg-[#0B5BC4] text-white text-lg">
              Download App
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
