import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bike, Wrench, Activity, HelpCircle, User, LogOut, Menu, X, PlusCircle, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navLinks = [
    { name: 'Marketplace', path: '/marketplace', icon: Bike },
    { name: 'Recommendations', path: '/recommendations', icon: HelpCircle },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Riding Style', path: '/riding-style', icon: Activity },
  ];

  return (
    <nav className="bg-black/95 border-b border-dark-border sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo - Matches Screenshot */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary group-hover:bg-primary/20 transition-colors">
                <Bike className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-primary font-black text-xl leading-none uppercase tracking-widest font-serif">MOTRONIX</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">SMART BIKE ECOSYSTEM</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links - Centered Active Indicators */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs uppercase tracking-widest font-bold transition-all duration-200 hover:text-primary ${
                    isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-gray-400'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* User Auth Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-5">
                <Link
                  to="/create-listing"
                  className="bg-primary hover:bg-primary-hover text-black px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-orange-900/10"
                >
                  List Bike
                </Link>
                
                {/* Username label with down chevron */}
                <div className="flex items-center space-x-2 text-gray-300 text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-white">
                  <User className="w-4 h-4 text-primary" />
                  <span>{user?.name || 'Pranav karande'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </div>

                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-dark-border/40 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-5">
                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary hover:bg-primary-hover text-black px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors shadow-md"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black border-b border-dark-border px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-dark-surface/50'
                }`}
              >
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          <div className="border-t border-dark-border my-3 pt-3">
            {isAuthenticated ? (
              <div className="space-y-4 px-3">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-bold">{user?.name}</span>
                </div>
                <Link
                  to="/create-listing"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center bg-primary hover:bg-primary-hover text-black w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  List Bike
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 text-red-400 hover:bg-red-500/10 w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-gray-400 hover:text-white text-center py-2.5 text-xs font-bold uppercase tracking-widest"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="bg-primary hover:bg-primary-hover text-black text-center py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-md"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
