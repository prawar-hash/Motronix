import React, { useState } from 'react';
import { recommendationsApi } from '../api/recommendationsApi';
import { Sparkles, Loader2, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, RefreshCw, Layers, CheckSquare, Square, X } from 'lucide-react';
import PriceBadge from '../components/PriceBadge';

const Recommendations = () => {
  // Wizard steps state
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // 10 parameter states
  const [budgetMin, setBudgetMin] = useState('50000');
  const [budgetMax, setBudgetMax] = useState('300000');
  const [usage, setUsage] = useState('daily commute');
  const [mileageImportance, setMileageImportance] = useState('balanced');
  const [preferredBikeType, setPreferredBikeType] = useState('commuter');
  const [brandPreference, setBrandPreference] = useState('');
  const [enginePower, setEnginePower] = useState('medium');
  const [ridingPriority, setRidingPriority] = useState('balanced');
  const [maintenanceBudget, setMaintenanceBudget] = useState('');
  const [resaleImportance, setResaleImportance] = useState('yes');
  const [ridingArea, setRidingArea] = useState('both');

  // App results & comparison states
  const [results, setResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonBikes, setComparisonBikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [error, setError] = useState(null);

  const brandsList = ['Royal Enfield', 'KTM', 'Yamaha', 'Bajaj', 'Hero', 'Honda', 'Suzuki', 'Kawasaki', 'Triumph', 'Harley-Davidson'];

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
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Bike Matchmaker</h1>
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
          
          {/* Step 1: Budget Bounds */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-dark-border/40 pb-3">Step 1: Set Your Budget Range</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Minimum Budget (₹)</label>
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="w-full bg-slate-950 border border-dark-border rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-primary font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Maximum Budget (₹)</label>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-full bg-slate-950 border border-dark-border rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-primary font-bold"
                  />
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

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-gray-400 text-sm">Processing similarity metrics over active databases...</p>
        </div>
      )}

      {/* Error block */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex items-center space-x-2 max-w-lg mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 5: Recommendations results */}
      {step === 5 && !loading && results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2 uppercase tracking-tight">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Recommended Bikes for You</span>
            </h2>
            <div className="flex space-x-3">
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
            {results.map((bike) => {
              const isSelected = selectedIds.includes(bike.id);
              return (
                <div
                  key={bike.id}
                  className={`bg-slate-900 border rounded-xl overflow-hidden shadow-lg flex flex-col group h-full relative ${isSelected ? 'border-primary' : 'border-dark-border'}`}
                >
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

                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-950 flex items-center justify-center p-6 text-center border-b border-dark-border/40">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Model Profile</h4>
                      <p className="text-xl font-black text-white">{bike.brand}</p>
                      <p className="text-sm font-semibold text-gray-400">{bike.model}</p>
                    </div>
                    {/* Match Score */}
                    <div className="absolute top-3 right-3 bg-primary text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                      {bike.match_score}% Match
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow space-y-4">
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
                      <p className="text-xs text-gray-300 leading-relaxed font-semibold">{bike.key_features}</p>
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
