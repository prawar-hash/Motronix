import React, { useState } from 'react';
import { recommendationsApi } from '../api/recommendationsApi';
import { HelpCircle, Loader2, Sparkles, AlertCircle, Check, Info, CheckSquare, Square, X } from 'lucide-react';
import PriceBadge from '../components/PriceBadge';

const Recommendations = () => {
  // Query parameters state
  const [budget, setBudget] = useState('1500');
  const [usage, setUsage] = useState('commute');
  const [preferredMileage, setPreferredMileage] = useState('2000');
  
  // Results & comparison state
  const [results, setResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonBikes, setComparisonBikes] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSelectedIds([]);
    setComparisonBikes([]);
    try {
      const data = await recommendationsApi.getRecommendations(budget, usage, preferredMileage);
      setResults(data);
    } catch (err) {
      setError("Failed to fetch recommendation profiles. Make sure listings database exists.");
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

  const handleRunComparison = async () => {
    if (selectedIds.length < 2) {
      alert("Please select at least 2 bikes to compare.");
      return;
    }
    setCompareLoading(true);
    try {
      const data = await recommendationsApi.compareListings(selectedIds);
      setComparisonBikes(data);
      // Scroll to comparison section
      setTimeout(() => {
        document.getElementById('comparison-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      alert("Failed to query comparison specifications.");
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Bike Matchmaker</h1>
        <p className="text-gray-400 text-sm">Input your profile parameters and let our similarity algorithm find your best fit.</p>
      </div>

      {/* Input Parameters Form */}
      <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-md">
        <form onSubmit={handleQuery} className="grid sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Max Budget ($)</label>
            <input
              type="number"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 1500"
              className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Usage Type</label>
            <select
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary"
            >
              <option value="commute">Daily Commuting</option>
              <option value="sport">Sport & Racing</option>
              <option value="off-road">Off-Road & Trail</option>
              <option value="touring">Touring & Travel</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Preferred Max Mileage</label>
            <input
              type="number"
              required
              value={preferredMileage}
              onChange={(e) => setPreferredMileage(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-orange-500/10 text-sm flex items-center justify-center space-x-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4.5 h-4.5" />}
            <span>{loading ? 'Analyzing matches...' : 'Get Recommendations'}</span>
          </button>
        </form>
      </div>

      {/* Error block */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex items-center space-x-2 max-w-lg mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results grid */}
      {!loading && results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recommended Matches ({results.length})</h2>
            
            {/* Run comparison button */}
            {selectedIds.length >= 2 && (
              <button
                onClick={handleRunComparison}
                disabled={compareLoading}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-md shadow-sky-500/10"
              >
                {compareLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Compare Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((bike) => {
              const isSelected = selectedIds.includes(bike.id);
              const imageUrl = bike.images && bike.images.length > 0
                ? bike.images[0]
                : 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={bike.id}
                  className={`bg-dark-surface border rounded-xl overflow-hidden shadow-lg flex flex-col group h-full relative ${isSelected ? 'border-primary' : 'border-dark-border'}`}
                >
                  {/* Select for comparison checkbox block */}
                  <button
                    onClick={() => handleSelectCompare(bike.id)}
                    className="absolute top-3 left-3 z-10 bg-dark-surface/90 hover:bg-dark-surface text-gray-300 p-2 rounded-lg border border-dark-border/80 transition-all flex items-center justify-center"
                    title="Select to compare"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
                    <img src={imageUrl} alt={bike.model} className="w-full h-full object-cover" />
                    {/* Match score badge */}
                    <div className="absolute top-3 right-3 bg-primary text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                      {bike.match_score}% Match
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-white group-hover:text-primary transition-colors truncate">
                        {bike.brand} <span className="font-normal text-gray-400">{bike.model}</span>
                      </h3>
                      <span className="font-black text-primary ml-2 shrink-0">${bike.asking_price}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-3 text-[11px] text-gray-400 font-semibold">
                      <div className="bg-dark-bg/60 border border-dark-border/40 py-1 px-2 rounded">
                        Year: {bike.year}
                      </div>
                      <div className="bg-dark-bg/60 border border-dark-border/40 py-1 px-2 rounded truncate">
                        {bike.mileage} miles
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-dark-border/40 text-xs">
                      <PriceBadge status={bike.price_status} />
                      <Link to={`/listings/${bike.id}`} className="text-primary font-bold hover:underline">
                        View Specs
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Panel */}
      {comparisonBikes.length > 0 && (
        <section id="comparison-section" className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-dark-border/40 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Info className="w-5 h-5 text-primary" />
              <span>Specification Comparison</span>
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
                  <th className="py-3 px-4 font-bold text-gray-400 uppercase text-xs">Specification</th>
                  {comparisonBikes.map(bike => (
                    <th key={bike.id} className="py-3 px-4 font-black text-white text-base">
                      {bike.brand} <span className="font-normal text-gray-400">{bike.model}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/30">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-400">Asking Price</td>
                  {comparisonBikes.map(b => (
                    <td key={b.id} className="py-3.5 px-4 text-primary font-black text-base">
                      ${parseFloat(b.asking_price).toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-400">Manufacturing Year</td>
                  {comparisonBikes.map(b => (
                    <td key={b.id} className="py-3.5 px-4 font-bold">{b.year}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-400">Mileage</td>
                  {comparisonBikes.map(b => (
                    <td key={b.id} className="py-3.5 px-4">{parseFloat(b.mileage).toLocaleString()} miles</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-400">Condition</td>
                  {comparisonBikes.map(b => (
                    <td key={b.id} className="py-3.5 px-4">
                      <span className="bg-dark-bg/60 border border-dark-border/40 py-1 px-2.5 rounded text-xs font-semibold text-orange-400 uppercase">
                        {b.condition}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-400">Market Evaluation</td>
                  {comparisonBikes.map(b => (
                    <td key={b.id} className="py-3.5 px-4">
                      <PriceBadge status={b.price_status} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-400">Seller Location</td>
                  {comparisonBikes.map(b => (
                    <td key={b.id} className="py-3.5 px-4 text-gray-400">{b.city}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-400">Link</td>
                  {comparisonBikes.map(b => (
                    <td key={b.id} className="py-3.5 px-4">
                      <Link to={`/listings/${b.id}`} className="text-primary font-bold hover:underline">
                        View Full Specs
                      </Link>
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
