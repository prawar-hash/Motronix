import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bike, ShieldAlert, Wrench, Activity, Search, HelpCircle, ArrowRight, TrendingUp } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  const features = [
    {
      title: 'Smart Marketplace',
      desc: 'Browse, search, and list bikes. Every bike is analyzed by our AI price predictor to flag overpriced and underpriced listings.',
      icon: Bike,
      link: '/marketplace',
      color: 'border-orange-500/20 hover:border-orange-500 text-orange-500',
    },
    {
      title: 'Personalized Recommender',
      desc: 'Input your usage, budget, and mileage targets, and our similarity engine will recommend the top matching bikes with comparison tables.',
      icon: HelpCircle,
      link: '/recommendations',
      color: 'border-sky-500/20 hover:border-sky-500 text-sky-500',
    },
    {
      title: 'Predictive Maintenance',
      desc: 'Log service events (oil, tires, brakes) and let our machine learning engine forecast due dates, wear warnings, and repair costs.',
      icon: Wrench,
      link: '/maintenance',
      color: 'border-emerald-500/20 hover:border-emerald-500 text-emerald-500',
    },
    {
      title: 'Riding Style Analyzer',
      desc: 'Upload CSV logs of speed and braking events. Our Random Forest classifier analyzes riding style metrics and provides tips.',
      icon: Activity,
      link: '/riding-style',
      color: 'border-purple-500/20 hover:border-purple-500 text-purple-500',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 text-center border-b border-dark-border/40 bg-gradient-to-b from-dark-surface/40 to-transparent">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6 relative">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/25 px-3 py-1.5 rounded-full text-xs font-bold text-primary tracking-wide uppercase">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>AI-Driven Bike Intelligence Platform</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            The Smart Ecosystem for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Riders & Buyers</span>
          </h1>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            BikeAI combines a premium peer-to-peer bike marketplace with explainable machine learning. Predict fair pricing, identify listing scams, project repair schedules, and classify ride style.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Explore Marketplace</span>
            </Link>
            
            {!isAuthenticated ? (
              <Link
                to="/signup"
                className="w-full sm:w-auto bg-dark-surface border border-dark-border hover:border-gray-500 text-gray-200 hover:text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Join Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/create-listing"
                className="w-full sm:w-auto bg-dark-surface border border-dark-border hover:border-primary text-gray-200 hover:text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Post a Listing</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white">Platform Modules</h2>
          <p className="text-gray-400 max-w-lg mx-auto text-sm">
            Everything you need to buy, sell, and maintain your ride with machine learning assistance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className={`bg-dark-surface border rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ${feat.color}`}
              >
                <div className="space-y-4">
                  <div className="bg-dark-bg p-3.5 rounded-xl w-fit border border-dark-border">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{feat.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
                </div>
                
                <Link
                  to={feat.link}
                  className="mt-6 flex items-center text-sm font-bold hover:underline group space-x-1.5 w-fit"
                >
                  <span>Launch Tool</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Synthetic medical disclaimers matching regulatory guardrails if applicable */}
      <section className="max-w-3xl mx-auto px-4 text-center">
        <div className="bg-dark-surface/50 border border-dark-border rounded-xl p-4 text-xs text-gray-500">
          <strong>Notice:</strong> All recommendation models, pricing predictions, safety classifications, and maintenance predictions are generated dynamically by experimental scikit-learn models based on user inputs and sample datasets. Users should inspect safety elements manually before riding.
        </div>
      </section>
    </div>
  );
};

export default Home;
