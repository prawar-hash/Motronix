import React from 'react';
import { Bike } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-surface border-t border-dark-border mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-primary font-black text-xl tracking-wider">
            <Bike className="w-6 h-6 stroke-[2.5]" />
            <span>BIKE<span className="text-white">AI</span></span>
          </div>
          <p className="text-gray-400 text-sm text-center md:text-right">
            &copy; {new Date().getFullYear()} BikeAI - Smart Bike Ecosystem. Built with Django & React.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
