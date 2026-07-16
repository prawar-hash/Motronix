import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bike, ShieldAlert, Wrench, Activity, HelpCircle, User, LogOut, Menu, X, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

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
    <nav className="bg-dark-surface border-b border-dark-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-primary font-black text-2xl tracking-wider">
              <Bike className="w-8 h-8 stroke-[2.5]" />
              <span>BIKE<span className="text-white">AI</span></span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center space-x-1.5 text-gray-300 hover:text-primary transition-colors duration-200 text-sm font-medium"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/create-listing"
                  className="flex items-center space-x-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md shadow-orange-500/10"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List Bike</span>
                </Link>
                <div className="flex items-center space-x-1.5 text-gray-300 bg-dark-bg/60 border border-dark-border px-3.5 py-1.5 rounded-lg text-sm">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-xs text-gray-500 bg-dark-border px-1.5 py-0.5 rounded">
                    Score: {user?.trust_score}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-dark-border/40 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md"
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
        <div className="md:hidden bg-dark-surface border-b border-dark-border px-2 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-2 text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          <div className="border-t border-dark-border my-2 pt-2">
            {isAuthenticated ? (
              <div className="space-y-3 px-3">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4 text-primary" />
                    <span>{user?.name}</span>
                  </div>
                  <span className="bg-dark-border px-1.5 py-0.5 rounded text-xs">
                    Score: {user?.trust_score}
                  </span>
                </div>
                <Link
                  to="/create-listing"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary-hover text-white w-full py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List Bike</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 text-red-400 hover:bg-red-500/10 w-full py-2.5 rounded-lg text-sm font-semibold border border-red-500/20"
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
                  className="text-gray-300 hover:text-white text-center py-2 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="bg-primary hover:bg-primary-hover text-white text-center py-2.5 rounded-lg text-sm font-semibold shadow-md"
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
