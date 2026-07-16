import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsApi } from '../api/listingsApi';
import { AuthContext } from '../context/AuthContext';
import { Bike, Sparkles, Upload, Loader2, ArrowLeft, ShieldAlert, Check } from 'lucide-react';

// Indian brand to models mapping catalog
const BRAND_MODELS_MAP = {
  'Royal Enfield': ['Classic 350', 'Bullet 350', 'Hunter 350', 'Meteor 350', 'Himalayan 450', 'Interceptor 650', 'Continental GT 650', 'Super Meteor 650', 'Shotgun 650'],
  'KTM': ['Duke 125', 'Duke 200', 'Duke 250', 'Duke 390', 'RC 125', 'RC 200', 'RC 390', 'Adventure 250', 'Adventure 390'],
  'Yamaha': ['R15 V4', 'MT-15 V2', 'FZ-S FI', 'FZ-X', 'R3', 'MT-03', 'Aerox 155', 'FZ25'],
  'Bajaj': ['Pulsar 125', 'Pulsar 150', 'Pulsar NS160', 'Pulsar NS200', 'Pulsar N250', 'Pulsar F250', 'Avenger Cruise 220', 'Dominar 250', 'Dominar 400', 'Pulsar 220F'],
  'Hero': ['Splendor Plus', 'HF Deluxe', 'Passion Pro', 'Glamour', 'Super Splendor', 'Xpulse 200 4V', 'Xpulse 200T', 'Xoom', 'Mavrick 440', 'Karizma XMR'],
  'Honda': ['Activa 6G', 'SP 125', 'Shine 125', 'Unicorn', 'Hornet 2.0', 'CB200X', 'CB350 H\'ness', 'CB350RS', 'XL750 Transalp', 'Africa Twin'],
  'Suzuki': ['Access 125', 'Burgman Street', 'Gixxer 150', 'Gixxer SF 150', 'Gixxer 250', 'Gixxer SF 250', 'V-Strom SX 250', 'Hayabusa', 'Katana'],
  'Kawasaki': ['Ninja 300', 'Ninja 400', 'Ninja 500', 'Ninja 650', 'Z650', 'Versys 650', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Z900'],
  'Triumph': ['Speed 400', 'Scrambler 400X', 'Trident 660', 'Tiger Sport 660', 'Tiger 900 GT', 'Street Triple R', 'Street Triple RS', 'Speed Triple 1200'],
  'Harley-Davidson': ['X440', 'Nightster', 'Sportster S', 'Fat Boy', 'Pan America 1250'],
  'Other': []
};

// Indian-calibrated local pricing formula for immediate user feedback
const calculateMockFairPrice = (brand, year, mileage, condition) => {
  const brandMultipliers = {
    'royal enfield': 1.1, 'ktm': 1.05, 'yamaha': 1.0,
    'bajaj': 0.85, 'hero': 0.8, 'honda': 1.0,
    'suzuki': 1.2, 'kawasaki': 1.3, 'triumph': 1.4,
    'harley-davidson': 1.5, 'other': 0.75
  };
  const condScores = { 'Poor': 1, 'Fair': 2, 'Good': 3, 'Excellent': 4 };
  
  const brand_clean = String(brand || 'other').trim().toLowerCase();
  const current_year = 2026;
  const age = Math.max(0, current_year - parseInt(year || current_year));
  const cond_score = condScores[condition] || 3;
  
  const base_price = 150000.0;
  const brand_mult = brandMultipliers[brand_clean] || brandMultipliers['other'];
  
  const age_depreciation = age * 12000.0;
  const mileage_depreciation = parseFloat(mileage || 0) * 1.50; // ₹1.5 per km depreciation
  const condition_mult = cond_score / 3.0;
  
  const predicted = (base_price * brand_mult - age_depreciation - mileage_depreciation) * condition_mult;
  return Math.max(15000.0, Math.round(predicted));
};

const CreateListing = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form states
  const [brand, setBrand] = useState('Royal Enfield');
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [year, setYear] = useState('2024');
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState('Good');
  const [askingPrice, setAskingPrice] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  
  // App states
  const [uploading, setUploading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize model choice whenever brand changes
  useEffect(() => {
    const models = BRAND_MODELS_MAP[brand] || [];
    if (models.length > 0) {
      setSelectedModel(models[0]);
    } else {
      setSelectedModel('Other');
    }
    setCustomModel('');
  }, [brand]);

  // Combined model value helper
  const getModelName = () => {
    return selectedModel === 'Other' ? customModel : selectedModel;
  };

  // Live price estimate
  const liveEstimate = (brand && year && mileage !== '') 
    ? calculateMockFairPrice(brand, year, mileage, condition) 
    : 0;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image exceeds the 5MB size limit.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const data = await listingsApi.uploadImage(file);
      setImages([data.url]);
    } catch (err) {
      setError(err.response?.data?.error || "Image upload failed. Try JPEG, PNG, or WEBP.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    const finalModel = getModelName();
    if (!finalModel || finalModel.trim() === '') {
      setError("Please specify a bike model.");
      return;
    }

    setSubmitLoading(true);
    setError(null);

    const payload = {
      brand,
      model: finalModel.trim(),
      year: parseInt(year),
      mileage: parseFloat(mileage),
      condition,
      asking_price: parseFloat(askingPrice),
      city,
      description: description.trim(),
      images
    };

    try {
      await listingsApi.createListing(payload);
      navigate('/marketplace');
    } catch (err) {
      setError(
        err.response?.data?.model?.[0] || 
        err.response?.data?.year?.[0] ||
        err.response?.data?.mileage?.[0] ||
        err.response?.data?.asking_price?.[0] ||
        "Failed to post listing. Please inspect fields."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 bg-slate-900 border border-dark-border rounded-2xl p-8 text-center space-y-6">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Authentication Required</h2>
        <p className="text-sm text-gray-400">You must be signed in to post a listing on the marketplace.</p>
        <div className="flex justify-center space-x-4">
          <a href="/login" className="bg-primary text-white py-2.5 px-6 rounded-xl text-xs font-bold">
            Sign In
          </a>
          <a href="/signup" className="bg-dark-border text-gray-300 py-2.5 px-6 rounded-xl text-xs font-bold">
            Join Free
          </a>
        </div>
      </div>
    );
  }

  const modelsAvailable = BRAND_MODELS_MAP[brand] || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="inline-flex items-center space-x-1 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Create Listing</h1>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-8 bg-slate-900 border border-dark-border rounded-2xl p-6 shadow-md space-y-6">
          
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs flex items-start space-x-2">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Brand Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Brand (Company)</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-950 border border-dark-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary"
              >
                {Object.keys(BRAND_MODELS_MAP).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            
            {/* Model Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Model Selection</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-950 border border-dark-border text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary"
              >
                {modelsAvailable.map(m => <option key={m} value={m}>{m}</option>)}
                <option value="Other">Other (Type custom model name)</option>
              </select>
            </div>
          </div>

          {/* Conditional model input field for Other */}
          {selectedModel === 'Other' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide text-primary">Specify Custom Model</label>
              <input
                type="text"
                required
                placeholder="Type custom model name (e.g. Speed 400)..."
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                className="w-full bg-slate-950 border border-primary/50 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Manufacturing Year</label>
              <input
                type="number"
                required
                placeholder="2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-950 border border-dark-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
            
            {/* Mileage */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Kms Run (km)</label>
              <input
                type="number"
                required
                placeholder="0"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full bg-slate-950 border border-dark-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {/* Condition */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-slate-950 border border-dark-border text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Metro Area</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-dark-border text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary"
              >
                {['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Kolkata', 'Hyderabad', 'Ahmedabad'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Asking Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Asking Price (₹)</label>
              <input
                type="number"
                required
                placeholder="e.g. 150000"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                className="w-full bg-slate-950 border border-dark-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Description</label>
            <textarea
              placeholder="Provide upgrades, standard km/l mileage, service logs history details..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-dark-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Upload Photo</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center space-x-2 bg-slate-950 hover:bg-slate-950/80 border border-dark-border hover:border-gray-500 rounded-xl py-3 px-5 text-sm font-semibold cursor-pointer text-gray-300 transition-colors">
                <Upload className="w-4 h-4 text-primary" />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {uploading && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
              {images.length > 0 && (
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                  <Check className="w-3.5 h-3.5" />
                  <span>Photo Uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live AI Valuation */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-dark-border rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="font-bold text-white flex items-center space-x-1.5 border-b border-dark-border/40 pb-3.5">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
              <span>Live AI Valuation</span>
            </h3>

            {liveEstimate > 0 ? (
              <div className="space-y-4">
                <div className="bg-slate-950 border border-dark-border p-4 rounded-xl text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Estimated Fair Price</p>
                  <p className="text-xl font-black text-emerald-400">₹{liveEstimate.toLocaleString('en-IN')}</p>
                </div>

                {askingPrice && (
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-medium">Asking Price:</span>
                      <span className="text-white font-bold">₹{parseFloat(askingPrice).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-medium">Difference:</span>
                      <span className={`font-bold ${askingPrice > liveEstimate * 1.15 ? 'text-rose-400' : askingPrice < liveEstimate * 0.85 ? 'text-sky-400' : 'text-emerald-400'}`}>
                        {(((askingPrice - liveEstimate) / liveEstimate) * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <p className="text-gray-400 leading-relaxed text-[11px] pt-2 border-t border-dark-border/40">
                      {askingPrice > liveEstimate * 1.15 
                        ? "Notice: Asking price sits > 15% above predicted valuation. Consider lowering to drive demand."
                        : askingPrice < liveEstimate * 0.85 
                        ? "Notice: This represents an underpriced offer and is expected to close quickly."
                        : "Notice: Asking price sits within competitive fair limits."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 leading-relaxed py-4 text-center">
                Input brand, manufacturing year, and distance run to generate a live Rupee valuation.
              </p>
            )}

            <button
              type="submit"
              disabled={submitLoading || uploading}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-gray-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-500/10 flex items-center justify-center space-x-1.5"
            >
              {submitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitLoading ? 'Publishing...' : 'Publish Listing'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateListing;
