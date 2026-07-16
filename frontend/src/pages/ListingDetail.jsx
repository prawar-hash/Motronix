import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingsApi } from '../api/listingsApi';
import { fraudApi } from '../api/fraudApi';
import { AuthContext } from '../context/AuthContext';
import PriceBadge from '../components/PriceBadge';
import RiskBadge from '../components/RiskBadge';
import { Calendar, Gauge, MapPin, Trash2, ArrowLeft, Loader2, Sparkles, User, AlertTriangle, ShieldCheck } from 'lucide-react';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  const [listing, setListing] = useState(null);
  const [fraudReport, setFraudReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchListingAndFraud = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch listing details
      const listingData = await listingsApi.getListing(id);
      setListing(listingData);

      // 2. Fetch fraud report (Requires authentication)
      if (localStorage.getItem('access_token')) {
        try {
          const fraudData = await fraudApi.getFraudReport(id);
          setFraudReport(fraudData);
        } catch (fErr) {
          console.log("Could not load fraud report (might be missing or server auth issue)", fErr);
        }
      }
    } catch (err) {
      setError("Failed to retrieve listing details. The record may have been deleted or the API is offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListingAndFraud();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
    setDeleteLoading(true);
    try {
      await listingsApi.deleteListing(id);
      navigate('/marketplace');
    } catch (err) {
      alert("Failed to delete listing. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-gray-400 text-sm">Loading vehicle intelligence report...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-md mx-auto my-16 bg-dark-surface border border-dark-border rounded-2xl p-8 text-center space-y-6">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Listing Not Found</h2>
        <p className="text-sm text-gray-400">{error || 'The requested listing does not exist.'}</p>
        <Link
          to="/marketplace"
          className="inline-flex items-center space-x-1 bg-primary text-white py-2.5 px-6 rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const isOwner = isAuthenticated && user && listing.seller && (listing.seller.id === user.id);
  const isStaff = isAuthenticated && user && user.is_staff;
  const showDelete = isOwner || isStaff;

  const imageUrl = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80';

  // Calculate pricing comparison details
  const askingPrice = parseFloat(listing.asking_price);
  const predictedPrice = parseFloat(listing.predicted_price || 0);
  const priceDiff = askingPrice - predictedPrice;
  const priceDiffPct = predictedPrice > 0 ? (priceDiff / predictedPrice) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link to="/marketplace" className="inline-flex items-center space-x-1.5 text-gray-400 hover:text-white text-sm font-semibold transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      {/* Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Side: Images & Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden shadow-md">
            <img src={imageUrl} alt={`${listing.brand} ${listing.model}`} className="w-full h-auto object-cover max-h-[500px]" />
          </div>

          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-xl font-bold text-white">Seller Description</h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {listing.description || "The seller has not provided a detailed description for this bicycle."}
            </p>
          </div>
        </div>

        {/* Right Side: Specifications, AI Price, and Fraud Assessment */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Title & Price */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 bg-dark-bg/60 border border-dark-border py-1.5 px-3 rounded-lg uppercase tracking-wider">
                {listing.condition} Condition
              </span>
              <PriceBadge status={listing.price_status} />
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white">{listing.brand}</h1>
              <p className="text-lg text-gray-400 font-medium">{listing.model}</p>
            </div>

            <div className="flex items-baseline justify-between border-t border-dark-border/40 pt-4">
              <span className="text-sm font-semibold text-gray-400">Asking Price:</span>
              <span className="text-3xl font-black text-primary">${askingPrice.toLocaleString()}</span>
            </div>

            {/* Spec Icons Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-bold text-gray-300">
              <div className="bg-dark-bg/50 border border-dark-border p-3.5 rounded-xl space-y-1">
                <Calendar className="w-4 h-4 mx-auto text-primary" />
                <p className="text-[10px] text-gray-500 uppercase">Year</p>
                <p className="text-sm font-black">{listing.year}</p>
              </div>
              <div className="bg-dark-bg/50 border border-dark-border p-3.5 rounded-xl space-y-1">
                <Gauge className="w-4 h-4 mx-auto text-primary" />
                <p className="text-[10px] text-gray-500 uppercase">Mileage</p>
                <p className="text-sm font-black truncate">{askingPrice.toLocaleString()} mi</p>
              </div>
              <div className="bg-dark-bg/50 border border-dark-border p-3.5 rounded-xl space-y-1">
                <MapPin className="w-4 h-4 mx-auto text-primary" />
                <p className="text-[10px] text-gray-500 uppercase">City</p>
                <p className="text-sm font-black truncate">{listing.city}</p>
              </div>
            </div>

            {/* Seller Contact Info */}
            <div className="bg-dark-bg/40 border border-dark-border/60 p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2.5">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 font-bold">Seller</p>
                  <p className="text-sm text-white font-medium">{listing.seller?.name || 'Verified User'}</p>
                </div>
                {listing.seller?.trust_score && (
                  <span className="ml-auto bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold py-1 px-2 rounded">
                    Trust: {listing.seller.trust_score}%
                  </span>
                )}
              </div>
              
              {!isOwner && (
                <button className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-bold py-3 rounded-lg transition-colors">
                  Contact Seller
                </button>
              )}
            </div>

            {/* Delete button (owner/admin) */}
            {showDelete && (
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-bold py-3 rounded-lg transition-all flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleteLoading ? 'Removing Listing...' : 'Delete Listing (Soft-Delete)'}</span>
              </button>
            )}
          </div>

          {/* AI Price Prediction Card */}
          {predictedPrice > 0 && (
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>AI Valuation Engine</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-bg/60 border border-dark-border p-3.5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Fair Market Price</p>
                  <p className="text-xl font-black text-emerald-400">${predictedPrice.toLocaleString()}</p>
                </div>
                <div className="bg-dark-bg/60 border border-dark-border p-3.5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Optimal Selling Range</p>
                  <p className="text-xl font-black text-sky-400">
                    ${(predictedPrice * 0.95).toFixed(0)} - ${(predictedPrice * 1.05).toFixed(0)}
                  </p>
                </div>
              </div>

              {/* Price deviation explanation */}
              <div className="text-xs text-gray-400 leading-relaxed border-t border-dark-border/40 pt-4">
                {priceDiffPct > 15 ? (
                  <p className="text-rose-400">
                    <strong>Notice:</strong> This bike is listed {priceDiffPct.toFixed(1)}% above the AI's predicted fair market value. Ensure the components are premium.
                  </p>
                ) : priceDiffPct < -15 ? (
                  <p className="text-sky-400">
                    <strong>Notice:</strong> This bike is listed {Math.abs(priceDiffPct).toFixed(1)}% below predicted value, representing a potential deal (verify details).
                  </p>
                ) : (
                  <p className="text-emerald-400">
                    <strong>Notice:</strong> Listing price is highly competitive, sitting within {Math.abs(priceDiffPct).toFixed(1)}% of the AI's target valuation.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Fraud Shield Analysis */}
          {isAuthenticated && (
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center space-x-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                  <span>Fraud Shield Assessment</span>
                </h3>
                {fraudReport && (
                  <RiskBadge label={fraudReport.risk_label} score={fraudReport.risk_score} />
                )}
              </div>

              {!fraudReport ? (
                <div className="text-xs text-gray-500 py-2">
                  No risk flags raised. Verify listing details with the seller directly.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Warning banner for High risk */}
                  {fraudReport.risk_label === 'High' && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs flex items-start space-x-2.5">
                      <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                      <span>
                        <strong>Caution:</strong> This listing is flagged as high-risk. We strongly advise against online payments or shipping.
                      </span>
                    </div>
                  )}

                  {/* List of factors */}
                  <div className="space-y-2 border-t border-dark-border/40 pt-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Analysis Factors:</p>
                    <ul className="text-xs text-gray-300 space-y-2 list-disc pl-4 leading-relaxed">
                      {fraudReport.reasons.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
