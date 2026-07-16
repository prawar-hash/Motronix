import React, { useState, useEffect } from 'react';
import { listingsApi } from '../api/listingsApi';
import BikeCard from '../components/BikeCard';
import { Search, Filter, Loader2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('');
  const [priceStatus, setPriceStatus] = useState('');
  const [city, setCity] = useState('');

  // Dropdown lists
  const brandsList = ['Trek', 'Specialized', 'Giant', 'Cannondale', 'Santa Cruz'];
  const conditionsList = ['Excellent', 'Good', 'Fair', 'Poor'];
  const priceStatusList = ['Fair', 'Underpriced', 'Overpriced'];

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (brand) params.brand = brand;
      if (condition) params.condition = condition;
      if (priceStatus) params.price_status = priceStatus;
      if (city) params.city = city;

      const data = await listingsApi.getListings(params);
      // DRF returns paginated results or a direct list depending on setup.
      // In settings.py we set DEFAULT_PAGINATION_CLASS which returns { results: [...] }
      setListings(data.results || data);
    } catch (err) {
      setError('Could not retrieve listings. Please verify connection to the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [brand, condition, priceStatus, city]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleClearFilters = () => {
    setSearch('');
    setBrand('');
    setCondition('');
    setPriceStatus('');
    setCity('');
    // Trigger update
    setTimeout(() => {
      listingsApi.getListings().then(data => setListings(data.results || data));
    }, 50);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-white">Marketplace</h1>
          <p className="text-gray-400 text-sm">Explore verified bike listings analyzed by artificial intelligence.</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-md space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by brand, model, or keywords..."
              className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl transition-colors shrink-0 text-sm flex items-center justify-center space-x-1.5"
          >
            <span>Search</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-gray-300">
          <div className="flex items-center space-x-1.5 text-gray-400 shrink-0">
            <Filter className="w-4 h-4 text-primary" />
            <span className="font-bold uppercase tracking-wider text-xs">Filter By:</span>
          </div>

          {/* Brand select */}
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="bg-dark-bg border border-dark-border text-white text-xs font-semibold py-2 px-3.5 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">All Brands</option>
            {brandsList.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          {/* Condition select */}
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="bg-dark-bg border border-dark-border text-white text-xs font-semibold py-2 px-3.5 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">All Conditions</option>
            {conditionsList.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Price status select */}
          <select
            value={priceStatus}
            onChange={(e) => setPriceStatus(e.target.value)}
            className="bg-dark-bg border border-dark-border text-white text-xs font-semibold py-2 px-3.5 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">All Price Statuses</option>
            {priceStatusList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* City filter input */}
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Filter by city..."
            className="bg-dark-bg border border-dark-border text-white text-xs py-2 px-3.5 rounded-lg focus:outline-none focus:border-primary w-36"
          />

          {/* Clear button */}
          {(brand || condition || priceStatus || city || search) && (
            <button
              onClick={handleClearFilters}
              className="text-primary hover:underline text-xs font-bold ml-auto shrink-0 flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-gray-400 text-sm">Analyzing market database...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-8 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 mx-auto" />
          <h3 className="font-bold text-lg text-white">Database Connection Failure</h3>
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={fetchListings}
            className="bg-dark-border hover:bg-dark-border/80 text-white font-bold py-2.5 px-6 rounded-xl text-xs"
          >
            Retry Fetch
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-dark-surface border border-dark-border rounded-2xl py-16 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="font-bold text-xl text-white">No Listings Found</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to see more bikes.
          </p>
          <button
            onClick={handleClearFilters}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-6 rounded-xl text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((bike) => (
            <BikeCard key={bike.id} listing={bike} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
