import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, DollarSign, Wrench, Shield, ArrowRight, Trophy, Star, ShieldAlert, Award, FileText } from 'lucide-react';

const Home = () => {
  // AI Feature definitions with navigation endpoints
  const aiFeatures = [
    {
      title: 'Price Prediction',
      desc: 'Get immediate fair market valuation using our Random Forest regressor mapped in Rupee ranges.',
      icon: DollarSign,
      link: '/marketplace'
    },
    {
      title: 'Fraud Detection',
      desc: 'Verify title deeds and evaluate listings authenticity with AI trust scores.',
      icon: ShieldCheck,
      link: '/marketplace'
    },
    {
      title: 'Smart Recommendations',
      desc: 'Input 10 distinct ride variables in our wizard simulator to match the ideal commuter or superbike.',
      icon: Sparkles,
      link: '/recommendations'
    },
    {
      title: 'Maintenance Predictor',
      desc: 'Anticipate parts failure schedules and view model-specific garage checklists.',
      icon: Wrench,
      link: '/maintenance'
    }
  ];

  // Benefits list
  const benefits = [
    {
      title: 'Smart AI Insights',
      desc: 'Make analytics-backed decisions on pricing and mechanical components.',
      icon: Trophy
    },
    {
      title: 'Safe Marketplace',
      desc: 'All listings receive security scores, and cross-patient uploads are server-side blocked.',
      icon: Shield
    },
    {
      title: 'Personalized Matches',
      desc: 'Get recommendations aligned with Indian roads, prices, and parts availability.',
      icon: Star
    }
  ];

  return (
    <div className="bg-black text-gray-200 min-h-screen">
      
      {/* 2. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-dark-border/40 py-16">
        {/* Full-width Highway Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1600&q=80"
            alt="Sports bike on highway"
            className="w-full h-full object-cover opacity-80"
          />
          {/* Radial Dark Gradient Mask Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Texts - Center/Left layout */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <div className="text-primary text-xs font-black tracking-widest uppercase font-serif">
              THE ULTIMATE
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-none uppercase font-serif">
              Smart Bike <br />
              Decisions <br />
              <span className="text-primary">Powered by AI</span>
            </h1>
            
            <p className="text-sm sm:text-base text-gray-400 max-w-lg leading-relaxed font-semibold">
              Buy, sell, and manage bikes with intelligent insights. Make analytics-backed pricing evaluations instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/marketplace"
                className="bg-primary hover:bg-primary-hover text-black px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Explore Bikes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                to="/create-listing"
                className="bg-transparent hover:bg-white/5 border-2 border-primary text-white px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center"
              >
                <span>Sell Your Bike</span>
              </Link>
            </div>
          </div>

          {/* Right Hero: Floating gold menu card matching reference image */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="bg-black/80 backdrop-blur-md border border-primary/20 p-8 rounded-2xl shadow-2xl w-full max-w-sm space-y-8 relative overflow-hidden">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 text-left">
                  <Award className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <h4 className="text-[10px] text-primary font-black uppercase tracking-widest">AI INSIGHTS</h4>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-left">
                  <Gauge className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <h4 className="text-[10px] text-primary font-black uppercase tracking-widest">REAL-TIME ANALYTICS</h4>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-left">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <h4 className="text-[10px] text-primary font-black uppercase tracking-widest">TRUSTED MARKETPLACE</h4>
                  </div>
                </div>
              </div>

              {/* Watermark logo */}
              <div className="text-[28px] font-black text-white/5 uppercase tracking-widest text-center mt-6 font-serif select-none">
                MOTRONIX
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AI FEATURES SECTION - Matches cream card layouts from provided reference image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 space-y-16">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <span className="w-8 h-[1px] bg-primary"></span>
            <span className="text-primary text-xs font-black tracking-widest uppercase font-serif">INTEGRATED AI FEATURES</span>
            <span className="w-8 h-[1px] bg-primary"></span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight uppercase font-serif max-w-3xl mx-auto">
            Experience our diagnostic stack designed <br />
            to secure, evaluate, and recommendation-map your rides.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Link
                key={idx}
                to={feat.link}
                className="bg-[#f4ebe1] border border-[#d6c7b5] rounded-xl p-6 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 flex flex-col justify-between min-h-[300px] group"
              >
                <div>
                  {/* Gold vintage style icon container */}
                  <div className="bg-[#eae0d2] border border-[#d6c7b5] p-3.5 rounded-xl text-[#8a6e4b] w-fit group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-lg font-black text-[#2b251f] mt-6 uppercase tracking-wide font-serif">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-gray-700 mt-3 leading-relaxed font-semibold">
                    {feat.desc}
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-[#8a6e4b] font-black uppercase tracking-wider mt-6 group-hover:underline">
                  <span>Access Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. WHY MOTRONIX SECTION - Mountain background texture matching screenshot */}
      <section className="relative py-24 bg-gradient-to-b from-black via-neutral-950 to-black border-t border-dark-border/30 text-center space-y-16">
        <div className="relative z-10 space-y-3">
          <h2 className="text-4xl font-black text-white uppercase tracking-tight font-serif">Why Motronix</h2>
          <div className="w-16 h-[2px] bg-primary mx-auto"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-3 gap-8 relative z-10">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="space-y-4 bg-transparent border-r last:border-r-0 border-dark-border/20 px-6 text-center">
                <div className="bg-primary/5 border border-primary/20 p-5 rounded-full text-primary w-fit mx-auto">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider font-serif">{b.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto font-semibold">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. CALL TO ACTION (CTA) - Royal Enfield Mountain Sunset background style */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden border-t border-b border-dark-border/20 py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1600&q=80"
            alt="Royal Enfield sunset"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-none font-serif">
            Find Your Perfect <br /> Bike Today
          </h2>
          <div className="w-16 h-[2px] bg-primary mx-auto my-2"></div>
          <p className="text-xs sm:text-sm font-bold text-gray-300 max-w-xl mx-auto leading-relaxed tracking-tight">
            Run the 10-parameter matchmaker wizard or check active diagnostic OBD logs under 2 minutes.
          </p>

          <div className="pt-4">
            <Link
              to="/recommendations"
              className="bg-primary hover:bg-primary-hover text-black font-black px-8 py-4 rounded-lg text-xs uppercase tracking-widest transition-all inline-flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
