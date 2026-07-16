import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Gauge } from 'lucide-react';
import PriceBadge from './PriceBadge';

const BikeCard = ({ listing }) => {
  // Use a fallback bike image if the images list is empty
  const imageUrl = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 flex flex-col group h-full">
      {/* Listing Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
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
            {listing.brand} <span className="font-normal text-gray-300">{listing.model}</span>
          </h3>
          <span className="font-black text-xl text-primary shrink-0 ml-2">
            ${parseFloat(listing.asking_price).toLocaleString()}
          </span>
        </div>

        {/* Technical specs badges */}
        <div className="grid grid-cols-3 gap-2 my-4 text-xs font-semibold text-gray-400">
          <div className="flex items-center space-x-1 bg-dark-bg/60 border border-dark-border/40 py-1.5 px-2 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{listing.year}</span>
          </div>
          <div className="flex items-center space-x-1 bg-dark-bg/60 border border-dark-border/40 py-1.5 px-2 rounded-lg truncate" title={`${listing.mileage} miles`}>
            <Gauge className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{listing.mileage >= 1000 ? `${(listing.mileage / 1000).toFixed(1)}k mi` : `${listing.mileage} mi`}</span>
          </div>
          <div className="flex items-center justify-center bg-dark-bg/60 border border-dark-border/40 py-1.5 px-2 rounded-lg">
            <span className="text-[10px] text-orange-400 uppercase tracking-wider">{listing.condition}</span>
          </div>
        </div>

        {/* Location & Details button */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-dark-border/40">
          <div className="flex items-center text-xs text-gray-400 space-x-1 truncate mr-2">
            <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span className="truncate">{listing.city}</span>
          </div>
          <Link
            to={`/listings/${listing.id}`}
            className="text-xs bg-dark-border hover:bg-primary hover:text-white text-gray-300 px-3.5 py-2 rounded-lg font-bold transition-all duration-200"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BikeCard;
