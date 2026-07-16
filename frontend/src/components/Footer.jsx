import React from 'react';
import { Link } from 'react-router-dom';
import { Bike, ArrowRight } from 'lucide-react';

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-[#090d16] border-t border-dark-border/45 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-dark-border/20">
        
        {/* Column 1: Logo & Socials */}
        <div className="space-y-4 text-left">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary">
              <Bike className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-primary font-black text-base leading-none uppercase tracking-widest font-serif">MOTRONIX</span>
              <span className="text-[7px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">SMART BIKE ECOSYSTEM</span>
            </div>
          </Link>
          <p className="text-xs text-gray-500 leading-relaxed font-semibold max-w-xs">
            AI-powered insights for buying, selling, and maintaining bikes. Built for riders, by riders.
          </p>
          <div className="flex items-center space-x-4 pt-2">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-primary transition-colors">
              <FacebookIcon />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-primary transition-colors">
              <InstagramIcon />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-primary transition-colors">
              <YoutubeIcon />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-4 text-left">
          <h4 className="text-xs font-black text-white uppercase tracking-widest font-serif border-l-2 border-primary pl-2">Quick Links</h4>
          <ul className="space-y-2.5 text-xs text-gray-400 font-semibold">
            <li><Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
            <li><Link to="/recommendations" className="hover:text-primary transition-colors">Recommendations</Link></li>
            <li><Link to="/maintenance" className="hover:text-primary transition-colors">Maintenance</Link></li>
            <li><Link to="/riding-style" className="hover:text-primary transition-colors">Riding Style</Link></li>
          </ul>
        </div>

        {/* Column 3: Resources */}
        <div className="space-y-4 text-left">
          <h4 className="text-xs font-black text-white uppercase tracking-widest font-serif border-l-2 border-primary pl-2">Resources</h4>
          <ul className="space-y-2.5 text-xs text-gray-400 font-semibold">
            <li><a href="#help" className="hover:text-primary transition-colors">Help Center</a></li>
            <li><a href="#works" className="hover:text-primary transition-colors">How It Works</a></li>
            <li><a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="#terms" className="hover:text-primary transition-colors">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Column 4: Newsletter */}
        <div className="space-y-4 text-left">
          <h4 className="text-xs font-black text-white uppercase tracking-widest font-serif border-l-2 border-primary pl-2">Newsletter</h4>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            Stay updated with the latest bike insights and offers.
          </p>
          <div className="flex bg-slate-950 border border-dark-border rounded-lg overflow-hidden max-w-sm">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent text-xs text-white px-3 py-2.5 w-full focus:outline-none placeholder-gray-600 font-semibold"
            />
            <button className="bg-primary hover:bg-primary-hover text-black px-4 flex items-center justify-center transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-wider gap-4">
        <span>&copy; {new Date().getFullYear()} Motronix - Smart Bike Ecosystem. Built with Django & React.</span>
        <div className="flex items-center space-x-2 text-primary opacity-60">
          <Bike className="w-4 h-4" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
