import React from 'react';
import { Sparkles, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const PriceBadge = ({ status }) => {
  const getBadgeStyles = () => {
    switch (status) {
      case 'Fair':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          icon: Sparkles,
          label: 'Fair Price',
        };
      case 'Underpriced':
        return {
          bg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
          icon: ArrowDownCircle,
          label: 'Great Deal',
        };
      case 'Overpriced':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          icon: ArrowUpCircle,
          label: 'Overpriced',
        };
      default:
        return {
          bg: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
          icon: Sparkles,
          label: status,
        };
    }
  };

  const badge = getBadgeStyles();
  const Icon = badge.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{badge.label}</span>
    </span>
  );
};

export default PriceBadge;
