import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bike, Wrench, Activity, Search, HelpCircle, ArrowRight, Gauge, Trophy } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);

  const features = [
    {
      title: 'Smart P2P Marketplace',
      desc: 'Browse and post bike listings. Our ML regression engine predicts a fair valuation in Indian Rupees (₹) to flag overpriced listings.',
      icon: Bike,
      link: '/marketplace',
      color: 'border-orange-500/20 hover:border-orange-500/80 text-orange-500 hover:shadow-orange-500/5',
      badge: '₹ INR Pricing'
    },
    {
      title: '10-Parameter Matchmaker',
      desc: 'Answer a simple wizard about your budget, usage area, cc preference, and priorities, and let our Similarity Engine find the top 3-5 matches.',
      icon: HelpCircle,
      link: '/recommendations',
      color: 'border-sky-500/20 hover:border-sky-500/80 text-sky-500 hover:shadow-sky-500/5',
      badge: 'Similarity ML'
    },
    {
      title: 'Garage Diagnostic Hub',
      desc: 'Log service cards and project maintenance logs. The ML service predictor projects check-up due dates, costs, and wear warnings.',
      icon: Wrench,
      link: '/maintenance',
      color: 'border-emerald-500/20 hover:border-emerald-500/80 text-emerald-400 hover:shadow-emerald-500/5',
      badge: 'Garage Theme'
    },
    {
      title: 'Riding Style Classifier',
      desc: 'Upload sensor ride logs (CSV). Our Random Forest classifier analyzes speed trends in km/h and provides actionable efficiency tips.',
      icon: Activity,
      link: '/riding-style',
      color: 'border-purple-500/20 hover:border-purple-500/80 text-purple-400 hover:shadow-purple-500/5',
      badge: 'RF Classifier'
    },
  ];

  return (
    <div className="space-y-16 pb-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 text-center border-b border-dark-border/40">
        {/* Carbon grid mesh overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(240,240,240,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(240,240,240,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-orange-600 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full text-xs font-black text-primary tracking-widest uppercase">
            <Trophy className="w-4.5 h-4.5 text-primary" />
            <span>MOTO-INTELLIGENCE PLATFORM</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-white leading-none">
            BIKE<span className="text-primary font-black">AI</span> ECOSYSTEM
          </h1>
          <p className="text-lg sm:text-xl font-bold text-gray-400 tracking-tight">
            Next-Gen Indian Marketplace & Telemetry Predictor
          </p>
          
          <p className="text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Configure your ride parameters in Rupees (₹) and Kilometers (km). From checking resale factors to logging garage service tickets, optimize your motor experience using explainable ML.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 border border-orange-400/20"
            >
              <Search className="w-4.5 h-4.5" />
              <span>Explore Showroom</span>
            </Link>
            
            {!isAuthenticated ? (
              <Link
                to="/signup"
                className="w-full sm:w-auto bg-slate-900 border border-dark-border hover:border-gray-500 text-gray-200 hover:text-white px-8 py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Register Ride</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/create-listing"
                className="w-full sm:w-auto bg-slate-900 border border-dark-border hover:border-primary text-gray-200 hover:text-white px-8 py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Sell a Bike</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">AI Diagnostic Bays</h2>
          <p className="text-gray-400 max-w-md mx-auto text-xs font-semibold">
            Choose your diagnostic module below to check pricing, service forecasts, or telemetry stats.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className={`bg-slate-900/60 border rounded-2xl p-7 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group ${feat.color}`}
              >
                {/* Warning stripe badge accent in background */}
                <div className="absolute top-0 right-0 bg-dark-border/40 text-[10px] font-black uppercase px-3.5 py-1.5 border-b border-l border-dark-border text-gray-400 group-hover:text-primary transition-colors">
                  {feat.badge}
                </div>

                <div className="space-y-4 pt-2">
                  <div className="bg-slate-950 p-4 rounded-xl w-fit border border-dark-border/80">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">{feat.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">{feat.desc}</p>
                </div>
                
                <Link
                  to={feat.link}
                  className="mt-8 flex items-center text-xs font-black uppercase tracking-wider text-gray-300 hover:text-white group space-x-2 w-fit bg-slate-950/80 hover:bg-primary border border-dark-border/60 hover:border-primary px-4 py-2.5 rounded-lg transition-all"
                >
                  <span>Access Terminal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Synthetic Disclaimers */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-slate-900/50 border border-dark-border/80 rounded-2xl p-5 text-[11px] text-gray-500 leading-relaxed max-w-3xl mx-auto">
          <strong>Diagnostic Disclaimer:</strong> All pricing predictions, fraud warnings, matching scores, and parts fatigue warnings are calculated using rule-based diagnostics and scikit-learn models. Users must verify all safety and physical conditions in a certified workshop before purchasing.
        </div>
      </section>
    </div>
  );
};

export default Home;
