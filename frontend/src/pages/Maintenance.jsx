import React, { useState, useEffect, useContext } from 'react';
import { maintenanceApi } from '../api/maintenanceApi';
import { AuthContext } from '../context/AuthContext';
import { Wrench, Calendar, Gauge, DollarSign, Loader2, ShieldAlert, Sparkles, AlertTriangle, ShieldCheck, Plus } from 'lucide-react';

const Maintenance = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // Service list state
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState(null);

  // Form states for new record
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState('General Tuning & Safety Check');
  const [mileage, setMileage] = useState('');
  const [cost, setCost] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Prediction states
  const [currentMileage, setCurrentMileage] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState(null);

  const serviceChoices = [
    'Chain Lube & Tension',
    'Brake Pads Replacement',
    'Tire Replacement',
    'Chain & Cassette Replacement',
    'General Tuning & Safety Check'
  ];

  const fetchRecords = async () => {
    setRecordsLoading(true);
    setRecordsError(null);
    try {
      const data = await maintenanceApi.getRecords();
      setRecords(data.results || data);
    } catch (err) {
      setRecordsError("Could not retrieve maintenance history logs.");
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecords();
    }
  }, [isAuthenticated]);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const payload = {
      service_date: serviceDate,
      service_type: serviceType,
      mileage: parseFloat(mileage),
      cost: parseFloat(cost),
    };

    try {
      await maintenanceApi.createRecord(payload);
      // Reset form
      setMileage('');
      setCost('');
      fetchRecords(); // Refresh logs
    } catch (err) {
      setFormError(err.response?.data?.mileage?.[0] || err.response?.data?.cost?.[0] || "Failed to log service record.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleGetPrediction = async (e) => {
    e.preventDefault();
    if (!currentMileage) return;

    setPredictLoading(true);
    setPredictError(null);
    try {
      const data = await maintenanceApi.getPrediction(currentMileage);
      setPrediction(data);
    } catch (err) {
      setPredictError(err.response?.data?.error || "Failed to compute service forecasting.");
    } finally {
      setPredictLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 bg-dark-surface border border-dark-border rounded-2xl p-8 text-center space-y-6">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Authentication Required</h2>
        <p className="text-sm text-gray-400">You must sign in to log bike service histories and access predictive forecasts.</p>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Predictive Maintenance</h1>
        <p className="text-gray-400 text-sm">Log historical repairs and use our regression model to forecast next service schedules.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Log and Schedule */}
        <div className="lg:col-span-8 space-y-8">
          {/* Predictive schedule query */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-1.5">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>AI Service Forecasting</span>
            </h2>

            <form onSubmit={handleGetPrediction} className="flex gap-3">
              <div className="relative flex-grow">
                <Gauge className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="number"
                  required
                  placeholder="Enter current bike mileage (mi)..."
                  value={currentMileage}
                  onChange={(e) => setCurrentMileage(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={predictLoading}
                className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl transition-colors shrink-0 text-sm flex items-center justify-center"
              >
                {predictLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Forecast Timeline</span>}
              </button>
            </form>

            {predictError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                {predictError}
              </div>
            )}

            {/* Prediction results */}
            {prediction && (
              <div className="bg-dark-bg/40 border border-dark-border p-5 rounded-xl space-y-4 animate-fade-in">
                <h3 className="font-bold text-sm text-gray-300 uppercase tracking-wide">Predicted Schedule Status</h3>
                
                <div className="grid sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-dark-surface border border-dark-border p-4 rounded-xl">
                    <Calendar className="w-4.5 h-4.5 mx-auto text-primary mb-1" />
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Estimated Due Date</p>
                    <p className="text-base font-black text-white">{prediction.next_service_date}</p>
                  </div>
                  <div className="bg-dark-surface border border-dark-border p-4 rounded-xl">
                    <Gauge className="w-4.5 h-4.5 mx-auto text-primary mb-1" />
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Estimated Mileage</p>
                    <p className="text-base font-black text-white">{prediction.next_service_mileage.toLocaleString()} mi</p>
                  </div>
                  <div className="bg-dark-surface border border-dark-border p-4 rounded-xl">
                    <DollarSign className="w-4.5 h-4.5 mx-auto text-primary mb-1" />
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Estimated Cost</p>
                    <p className="text-base font-black text-emerald-400">${prediction.estimated_cost}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-dark-border/40 pt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Expected Part Failures / Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.likely_failures.map((f, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-3 py-1 rounded text-xs font-semibold flex items-center space-x-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{f}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-400 italic pt-2 leading-relaxed border-t border-dark-border/40">
                  {prediction.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Service timeline logs */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-white">Service History Timeline</h2>

            {recordsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : recordsError ? (
              <div className="text-xs text-rose-400 py-4 text-center">{recordsError}</div>
            ) : records.length === 0 ? (
              <p className="text-sm text-gray-500 py-10 text-center">
                No service records logged. Use the right form to create your first log.
              </p>
            ) : (
              <div className="relative border-l-2 border-dark-border ml-3.5 space-y-6 py-2">
                {records.map((rec) => (
                  <div key={rec.id} className="relative pl-6">
                    {/* Bullet marker */}
                    <div className="absolute -left-[9px] top-1.5 bg-primary border-4 border-dark-surface w-4 h-4 rounded-full"></div>
                    
                    <div className="bg-dark-bg/40 border border-dark-border/60 p-4 rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm">{rec.service_type}</h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            <span>{rec.service_date}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Gauge className="w-3.5 h-3.5 text-gray-500" />
                            <span>{rec.mileage.toLocaleString()} mi</span>
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-400 shrink-0 ml-4">
                        ${parseFloat(rec.cost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Log New Service Form */}
        <div className="lg:col-span-4 bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-md h-fit space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center space-x-1.5 border-b border-dark-border/40 pb-3">
            <Plus className="w-5 h-5 text-primary" />
            <span>Log Service Event</span>
          </h2>

          {formError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateRecord} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Service Date</label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary"
              >
                {serviceChoices.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Mileage at Service (mi)</label>
              <input
                type="number"
                required
                placeholder="e.g. 1200"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Repair Cost ($)</label>
              <input
                type="number"
                required
                step="0.01"
                placeholder="e.g. 45.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center"
            >
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Log Record</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
