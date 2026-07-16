import React, { useState } from 'react';
import { recommendationsApi } from '../api/recommendationsApi';
import { Sparkles, Loader2, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, RefreshCw, Layers, CheckSquare, Square, X, Sliders } from 'lucide-react';
import PriceBadge from '../components/PriceBadge';
import BikeLoader from '../components/BikeLoader';

// Mappers to fetch official/original-looking photos of the exact suggested Indian and imported bike models
const getBikeImage = (brand, model) => {
  const brand_lower = String(brand).toLowerCase();
  const model_lower = String(model).toLowerCase();
  
  // 1. Royal Enfield models
  if (model_lower.includes('himalayan')) {
    return 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80'; // Himalayan adventure model
  }
  if (model_lower.includes('classic') || model_lower.includes('bullet') || brand_lower.includes('royal enfield')) {
    return 'https://images.unsplash.com/photo-1610444318721-c4d62bcf81cb?auto=format&fit=crop&w=800&q=80'; // RE Classic / Bullet thumper style
  }
  
  // 2. KTM models
  if (model_lower.includes('duke') || brand_lower.includes('ktm')) {
    return 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=800&q=80'; // Orange KTM Duke 390/200
  }
  
  // 3. Yamaha models
  if (model_lower.includes('r15') || model_lower.includes('mt-15') || brand_lower.includes('yamaha')) {
    return 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80'; // Blue Yamaha R15 sportbike
  }
  
  // 4. Hero models
  if (model_lower.includes('splendor') || brand_lower.includes('hero')) {
    return 'https://images.unsplash.com/photo-1622185135505-2d795003994a?auto=format&fit=crop&w=800&q=80'; // Standard Indian commuter (Splendor)
  }
  
  // 5. Bajaj models
  if (model_lower.includes('pulsar') || brand_lower.includes('bajaj')) {
    return 'https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?auto=format&fit=crop&w=800&q=80'; // Bajaj Pulsar sport street thumper
  }
  
  // 6. Honda models
  if (model_lower.includes('h\'ness') || model_lower.includes('cb350') || brand_lower.includes('honda')) {
    return 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80'; // Honda H'ness cruiser style
  }
  
  // 7. Suzuki models
  if (model_lower.includes('hayabusa') || brand_lower.includes('suzuki')) {
    return 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'; // Suzuki GSX-R / Hayabusa style
  }
  
  // 8. Kawasaki models
  if (model_lower.includes('ninja') || model_lower.includes('zx') || brand_lower.includes('kawasaki')) {
    return 'https://images.unsplash.com/photo-1533230393054-041a506a6346?auto=format&fit=crop&w=800&q=80'; // Lime green Kawasaki Ninja ZX superbike
  }
  
  // 9. Triumph models
  if (model_lower.includes('tiger') || brand_lower.includes('triumph')) {
    return 'https://images.unsplash.com/photo-1508898578281-774ac4893c0c?auto=format&fit=crop&w=800&q=80'; // Triumph Tiger adventure tourer
  }
  
  // 10. Harley Davidson models
  if (model_lower.includes('iron') || brand_lower.includes('harley')) {
    return 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80'; // Harley-Davidson Iron 883 cruiser
  }
  
  // Generic fallback motorcycle image
  return 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80';
};

const Recommendations = () => {
  // Wizard steps state
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // 10 parameter states (sliding limits)
  const [budgetMin, setBudgetMin] = useState(50000);
  const [budgetMax, setBudgetMax] = useState(300000);
  const [usage, setUsage] = useState('daily commute');
  const [mileageImportance, setMileageImportance] = useState('balanced');
  const [preferredBikeType, setPreferredBikeType] = useState('commuter');
  const [brandPreference, setBrandPreference] = useState('');
  const [enginePower, setEnginePower] = useState('medium');
  const [ridingPriority, setRidingPriority] = useState('balanced');
  const [maintenanceBudget, setMaintenanceBudget] = useState('');
  const [resaleImportance, setResaleImportance] = useState('yes');
  const [ridingArea, setRidingArea] = useState('both');

  // Sorting state
  const [sortBy, setSortBy] = useState('match'); // 'match', 'price_asc', 'price_desc'

  // App results & comparison states
  const [results, setResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonBikes, setComparisonBikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [error, setError] = useState(null);

  const brandsList = ['Royal Enfield', 'KTM', 'Yamaha', 'Bajaj', 'Hero', 'Honda', 'Suzuki', 'Kawasaki', 'Triumph'];

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmitWizard = async () => {
    setLoading(true);
    setError(null);
    setSelectedIds([]);
    setComparisonBikes([]);
    
    const payload = {
      budget_min: parseFloat(budgetMin),
      budget_max: parseFloat(budgetMax),
      usage,
      mileage_importance: mileageImportance,
      preferred_bike_type: preferredBikeType,
      brand_preference: brandPreference,
      engine_power: enginePower,
      riding_priority: ridingPriority,
      maintenance_budget: maintenanceBudget ? parseFloat(maintenanceBudget) : null,
      resale_importance: resaleImportance,
      riding_area: ridingArea
    };

    try {
      const data = await recommendationsApi.getRecommendations(payload);
      setResults(data);
      setStep(5); // Move to results step
    } catch (err) {
      setError("Failed to fetch recommendation profiles. Please check database connections.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompare = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert("You can select a maximum of 3 bikes for comparison.");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCompareSubmit = async () => {
    if (selectedIds.length < 2) {
      alert("Please select at least 2 bikes to compare.");
      return;
    }
    setCompareLoading(true);
    try {
      const data = await recommendationsApi.compareListings(selectedIds);
      setComparisonBikes(data);
      setTimeout(() => {
        document.getElementById('comparison-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      alert("Failed to compare bike specifications.");
    } finally {
      setCompareLoading(false);
    }
  };

  const handleResetWizard = () => {
    setStep(1);
    setResults([]);
    setSelectedIds([]);
    setComparisonBikes([]);
    setError(null);
    setSortBy('match');
  };

  // Sort logic for display
  const getSortedResults = () => {
    const sorted = [...results];
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => parseFloat(a.asking_price) - parseFloat(b.asking_price));
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => parseFloat(b.asking_price) - parseFloat(a.asking_price));
    } else {
      sorted.sort((a, b) => b.match_score - a.match_score);
    }
    return sorted;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Motronix Matchmaker</h1>
          <p className="text-gray-400 text-sm">Find your optimal bike match using our 10-parameter similarity calculator.</p>
        </div>
        {step > 1 && (
          <button
            onClick={handleResetWizard}
            className="text-xs text-primary hover:underline font-bold flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Wizard</span>
          </button>
        )}
      </div>

      {/* Progress Bar (Visible for Wizard steps 1-4) */}
      {step <= totalSteps && (
        <div className="w-full bg-slate-900 border border-dark-border p-4 rounded-xl flex items-center justify-between text-xs font-bold text-gray-400">
          <div className="flex items-center space-x-2">
            <span className={`w-6 h-6 flex items-center justify-center rounded-full border ${step >= 1 ? 'bg-primary text-white border-primary' : 'border-dark-border'}`}>1</span>
            <span className={step >= 1 ? 'text-white' : ''}>Budget</span>
          </div>
          <div className="w-full h-[1px] bg-dark-border mx-4"></div>
          <div className="flex items-center space-x-2">
            <span className={`w-6 h-6 flex items-center justify-center rounded-full border ${step >= 2 ? 'bg-primary text-white border-primary' : 'border-dark-border'}`}>2</span>
            <span className={step >= 2 ? 'text-white' : ''}>Ride Profile</span>
          </div>
          <div className="w-full h-[1px] bg-dark-border mx-4"></div>
          <div className="flex items-center space-x-2">
            <span className={`w-6 h-6 flex items-center justify-center rounded-full border ${step >= 3 ? 'bg-primary text-white border-primary' : 'border-dark-border'}`}>3</span>
            <span className={step >= 3 ? 'text-white' : ''}>Specs</span>
          </div>
          <div className="w-full h-[1px] bg-dark-border mx-4"></div>
          <div className="flex items-center space-x-2">
            <span className={`w-6 h-6 flex items-center justify-center rounded-full border ${step >= 4 ? 'bg-primary text-white border-primary' : 'border-dark-border'}`}>4</span>
            <span className={step >= 4 ? 'text-white' : ''}>Priorities</span>
          </div>
        </div>
      )}

      {/* Wizard Form Panels */}
      {step <= totalSteps && (
        <div className="bg-slate-900 border border-dark-border rounded-2xl p-8 shadow-xl max-w-2xl mx-auto space-y-6">
          
          {/* Step 1: Budget Range Sliders */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <h3 className="text-xl font-bold text-white border-b border-dark-border/40 pb-3 flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-primary" />
                <span>Step 1: Slide Budget Range</span>
              </h3>
              
              <div className="space-y-6">
                {/* Min Budget Range */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-gray-400">Minimum Budget</span>
                    <span className="text-primary text-sm font-black">₹{parseFloat(budgetMin).toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="5000"
                    value={budgetMin}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setBudgetMin(val);
                      if (val > budgetMax) setBudgetMax(val + 10000);
                    }}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-primary border border-dark-border"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                    <span>₹10,000</span>
                    <span>₹5.0 Lakhs</span>
                  </div>
                </div>

                {/* Max Budget Range */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-gray-400">Maximum Budget</span>
                    <span className="text-primary text-sm font-black">₹{parseFloat(budgetMax).toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min={budgetMin}
                    max="2500000"
                    step="10000"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-primary border border-dark-border"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                    <span>₹{parseFloat(budgetMin).toLocaleString('en-IN')}</span>
                    <span>₹25.0 Lakhs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Ride Profile */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-dark-border/40 pb-3">Step 2: Tell Us About Your Rides</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Usage Type</label>
                  <select
                    value={usage}
                    onChange={(e) => setUsage(e.target.value)}
                    className="w-full bg-slate-950 border border-dark-border text-white rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="daily commute">Daily Commute</option>
                    <option value="long rides">Long Highway Rides</option>
                    <option value="sports">Sports & Racing</option>
                    <option value="off-road">Off-Roading & Trail Adventure</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Riding Area</label>
                  <select
                    value={ridingArea}
                    onChange={(e) => setRidingArea(e.target.value)}
                    className="w-full bg-slate-950 border border-dark-border text-white rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="city">Inside City Traffic</option>
                    <option value="highway">High-speed Highways</option>
                    <option value="both">Both City and Highways</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Specs Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-dark-border/40 pb-3">Step 3: Technical Preferences</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Bike Type</label>
                  <select
                    value={preferredBikeType}
                    onChange={(e) => setPreferredBikeType(e.target.value)}
                    className="w-full bg-slate-950 border border-dark-border text-white rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="commuter">Standard Commuter</option>
                    <option value="cruiser">Cruiser / Chopper</option>
                    <option value="sports">Sports / Racing</option>
                    <option value="adventure">Adventure Tourer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Engine Power</label>
                  <select
                    value={enginePower}
                    onChange={(e) => setEnginePower(e.target.value)}
                    className="w-full bg-slate-950 border border-dark-border text-white rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="low">Low CC (100-150cc)</option>
                    <option value="medium">Medium CC (150-400cc)</option>
                    <option value="high">High CC (400cc+)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Preferred Brand (Optional)</label>
                  <select
                    value={brandPreference}
                    onChange={(e) => setBrandPreference(e.target.value)}
                    className="w-full bg-slate-950 border border-dark-border text-white rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">No Preference</option>
                    {brandsList.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Priorities */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-dark-border/40 pb-3">Step 4: Priorities & Financials</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Riding Priority</label>
                  <select
                    value={ridingPriority}
                    onChange={(e) => setRidingPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-dark-border text-white rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="comfort">Maximum Comfort</option>
                    <option value="performance">Maximum Speed/Performance</option>
                    <option value="balanced">Balanced Performance & Handling</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Fuel Economy (Mileage) Priority</label>
                  <select
                    value={mileageImportance}
                    onChange={(e) => setMileageImportance(e.target.value)}
                    className="w-full bg-slate-950 border border-dark-border text-white rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="high">High (Maximum km/l priority)</option>
                    <option value="balanced">Balanced Mileage</option>
                    <option value="low">Low Mileage Importance</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Is Resale Value Important?</label>
                  <select
                    value={resaleImportance}
                    onChange={(e) => setResaleImportance(e.target.value)}
                    className="w-full bg-slate-950 border border-dark-border text-white rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="yes">Yes, High Resale Priority</option>
                    <option value="no">No, Not Crucial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Max Yearly Maintenance Budget (Optional - ₹)</label>
                  <input
                    type="number"
                    value={maintenanceBudget}
                    onChange={(e) => setMaintenanceBudget(e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full bg-slate-950 border border-dark-border rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Button actions */}
          <div className="flex justify-between items-center pt-4 border-t border-dark-border/40">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="bg-slate-950 hover:bg-slate-950/80 text-gray-300 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}
            
            {step < totalSteps ? (
              <button
                onClick={handleNext}
                className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center space-x-1"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitWizard}
                className="bg-primary hover:bg-primary-hover text-white font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-lg shadow-orange-500/10"
              >
                <Sparkles className="w-4 h-4" />
                <span>Calculate Recommendations</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading state using custom BikeLoader */}
      {loading && (
        <BikeLoader message="Processing Similarity Metrics & Mapped Bike Images..." />
      )}

      {/* Error block */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex items-center space-x-2 max-w-lg mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 5: Recommendations results with sorting filters */}
      {step === 5 && !loading && results.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2 uppercase tracking-tight">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Recommended Bikes for You</span>
            </h2>
            
            {/* Sorting controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-dark-border px-3.5 py-2 rounded-xl text-xs font-bold text-gray-400">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none cursor-pointer text-xs font-bold"
                >
                  <option className="bg-slate-950" value="match">Match Rating (%)</option>
                  <option className="bg-slate-950" value="price_asc">Price: Low to High</option>
                  <option className="bg-slate-950" value="price_desc">Price: High to Low</option>
                </select>
              </div>

              {selectedIds.length >= 2 && (
                <button
                  onClick={handleCompareSubmit}
                  disabled={compareLoading}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center space-x-1.5 shadow-md shadow-sky-500/10"
                >
                  {compareLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Compare Selected ({selectedIds.length})</span>
                </button>
              )}

              <button
                onClick={handleResetWizard}
                className="bg-slate-900 border border-dark-border hover:border-gray-500 text-gray-300 font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                Reset Wizard
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getSortedResults().map((bike) => {
              const isSelected = selectedIds.includes(bike.id);
              const bikePhoto = getBikeImage(bike.brand, bike.model);
              return (
                <div
                  key={bike.id}
                  className={`bg-slate-900 border rounded-xl overflow-hidden shadow-lg flex flex-col group h-full relative ${isSelected ? 'border-primary' : 'border-dark-border'}`}
                >
                  {/* Selector checkbox */}
                  <button
                    onClick={() => handleSelectCompare(bike.id)}
                    className="absolute top-3 left-3 z-10 bg-slate-950/90 hover:bg-slate-950 text-gray-300 p-2 rounded-lg border border-dark-border/80 transition-all flex items-center justify-center"
                    title="Select to compare"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  {/* Bike Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-950 border-b border-dark-border/40">
                    <img
                      src={bikePhoto}
                      alt={`${bike.brand} ${bike.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Match Score overlay */}
                    <div className="absolute top-3 right-3 bg-primary text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                      {bike.match_score}% Match
                    </div>
                  </div>

                  {/* Card Description */}
                  <div className="p-5 flex flex-col flex-grow space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Model Profile</h4>
                      <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors">
                        {bike.brand} <span className="font-normal text-gray-400 text-sm">{bike.model}</span>
                      </h3>
                    </div>

                    <div className="flex justify-between items-baseline border-b border-dark-border/30 pb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Showroom Price</span>
                      <span className="text-lg font-black text-primary">₹{parseFloat(bike.asking_price).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <div className="bg-slate-950 border border-dark-border/40 py-1.5 px-2 rounded-lg text-center truncate">
                        Mileage: {bike.fuel_economy} km/l
                      </div>
                      <div className="bg-slate-950 border border-dark-border/40 py-1.5 px-2 rounded-lg text-center truncate">
                        Displacement: {bike.engine_cc} cc
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Key Features:</p>
                      <p className="text-xs text-gray-300 leading-relaxed font-semibold line-clamp-2" title={bike.key_features}>
                        {bike.key_features}
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-dark-border/60 p-3 rounded-lg text-xs text-primary leading-relaxed mt-auto font-medium">
                      <strong>AI Verdict:</strong> {bike.why_recommended}
                    </div>

                    {bike.id > 0 && (
                      <Link
                        to={`/listings/${bike.id}`}
                        className="text-xs bg-dark-border hover:bg-primary hover:text-white text-gray-300 py-2.5 rounded-lg font-bold transition-colors text-center uppercase tracking-wider"
                      >
                        Inspect Listing
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison table */}
      {comparisonBikes.length > 0 && (
        <section id="comparison-section" className="bg-slate-900 border border-dark-border rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-dark-border/40 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-primary animate-pulse" />
              <span>Spec-Comparison Table</span>
            </h3>
            <button
              onClick={() => setComparisonBikes([])}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead>
                <tr className="border-b border-dark-border/60">
                  <th className="py-3 px-4 font-bold text-gray-400 uppercase text-xs">Bike Spec</th>
                  {comparisonBikes.map(bike => (
                    <th key={bike.id} className="py-3 px-4 font-black text-white text-base">
                      {bike.brand} <span className="font-normal text-gray-400">{bike.model}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/30">
                <tr>
                  <td className="py-4 px-4 font-bold text-gray-400">Target Price (₹)</td>
                  {comparisonBikes.map(b => (
                    <td key={b.id} className="py-4 px-4 text-primary font-black text-base">
                      ₹{parseFloat(b.asking_price).toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-gray-400">Fuel Economy (Mileage)</td>
                  {comparisonBikes.map(b => (
                    <td key={b.id} className="py-4 px-4 font-black text-emerald-400">{b.fuel_economy} km/l</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-gray-400">Engine Displacement</td>
                  {comparisonBikes.map(b => (
                    <td key={b.id} className="py-4 px-4 font-bold">{b.engine_cc} cc</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-gray-400">Bike Type</td>
                  {comparisonBikes.map(b => (
                    <td key={b.id} className="py-4 px-4 capitalize font-semibold">{b.type}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-gray-400">Resale Category</td>
                  {comparisonBikes.map(b => {
                    const isImp = b.is_imported;
                    return (
                      <td key={b.id} className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${isImp ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                          {isImp ? 'Imported (Low Resale)' : 'Indian Standard (High Resale)'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-gray-400">Key Features</td>
                  {comparisonBikes.map(b => (
                    <td key={b.id} className="py-4 px-4 text-gray-400 max-w-[250px] leading-relaxed text-xs">
                      {b.key_features}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default Recommendations;
