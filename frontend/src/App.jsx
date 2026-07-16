import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Recommendations from './pages/Recommendations';
import Maintenance from './pages/Maintenance';
import RidingStyleAnalyzer from './pages/RidingStyleAnalyzer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-dark-bg text-gray-100">
          <Navbar />
          
          <main className="flex-grow container mx-auto px-4 py-6">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Private Routes (handled internally in component UI or state checks) */}
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/riding-style" element={<RidingStyleAnalyzer />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
