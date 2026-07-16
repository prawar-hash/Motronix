import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

const RiskBadge = ({ label, score }) => {
  const getBadgeStyles = () => {
    switch (label) {
      case 'Low':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          icon: ShieldCheck,
        };
      case 'Medium':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          icon: AlertTriangle,
        };
      case 'High':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse',
          icon: ShieldAlert,
        };
      default:
        return {
          bg: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
          icon: ShieldCheck,
        };
    }
  };

  const badge = getBadgeStyles();
  const Icon = badge.icon;

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label} Risk {score !== undefined && `(${score}%)`}</span>
    </span>
  );
};

export default RiskBadge;
