import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Gauge } from 'lucide-react';
import PriceBadge from './PriceBadge';

const BikeCard = ({ listing }) => {
  // Fallback image using Unsplash Indian motorcycle photo
  const imageUrl = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="bg-slate-900 border border-dark-border rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 flex flex-col group h-full">
      {/* Listing Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={imageUrl}
          alt={`${listing.brand} ${listing.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <PriceBadge status={listing.price_status} />
        </div>
      </div>

      {/* Listing Details */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors line-clamp-1">
            {listing.brand} <span className="font-normal text-gray-400">{listing.model}</span>
          </h3>
          <span className="font-black text-xl text-primary shrink-0 ml-2">
            ₹{parseFloat(listing.asking_price).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Odometer, Year, and Condition */}
        <div className="grid grid-cols-3 gap-2 my-4 text-xs font-semibold text-gray-400">
          <div className="flex items-center space-x-1 bg-slate-950/60 border border-dark-border/40 py-1.5 px-2 rounded-lg justify-center">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{listing.year}</span>
          </div>
          <div className="flex items-center space-x-1 bg-slate-950/60 border border-dark-border/40 py-1.5 px-2 rounded-lg justify-center truncate" title={`${listing.mileage} km`}>
            <Gauge className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">
              {listing.mileage >= 1000 ? `${(listing.mileage / 1000).toFixed(0)}k km` : `${listing.mileage} km`}
            </span>
          </div>
          <div className="flex items-center justify-center bg-slate-950/60 border border-dark-border/40 py-1.5 px-2 rounded-lg">
            <span className="text-[10px] text-orange-400 uppercase tracking-wider">{listing.condition}</span>
          </div>
        </div>

        {/* City and Details trigger */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-dark-border/40">
          <div className="flex items-center text-xs text-gray-400 space-x-1 truncate mr-2">
            <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span className="truncate">{listing.city}</span>
          </div>
          <Link
            to={`/listings/${listing.id}`}
            className="text-xs bg-dark-border hover:bg-primary hover:text-white text-gray-300 px-3.5 py-2 rounded-lg font-bold transition-all duration-200"
          >
            Inspect
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BikeCard;
