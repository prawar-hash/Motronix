import React from 'react';
import { Bike } from 'lucide-react';

const BikeLoader = ({ message = "Scanning Telemetry..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full">
      <style>{`
        @keyframes bike-ride {
          0% {
            transform: translateX(-40px);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateX(180px);
            opacity: 0;
          }
        }
        .animate-bike-ride {
          animation: bike-ride 1.6s infinite linear;
        }
      `}</style>
      
      <div className="relative w-[200px] h-[36px] overflow-hidden">
        {/* Horizon Road Track */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-dark-border"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[linear-gradient(90deg,#f59e0b_50%,transparent_50%)] bg-[size:10px_2px]"></div>
        
        {/* Bike Icon Riding */}
        <div className="absolute bottom-1 left-0 animate-bike-ride">
          <Bike className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      {message && (
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default BikeLoader;
