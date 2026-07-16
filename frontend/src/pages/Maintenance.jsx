import React, { useState, useEffect, useContext } from 'react';
import { maintenanceApi } from '../api/maintenanceApi';
import { AuthContext } from '../context/AuthContext';
import { Wrench, Calendar, Gauge, DollarSign, Loader2, ShieldAlert, Sparkles, AlertTriangle, ShieldCheck, Plus, CheckCircle, Flame } from 'lucide-react';

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
      setMileage('');
      setCost('');
      fetchRecords();
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
      <div className="max-w-md mx-auto my-16 bg-slate-900 border border-dark-border rounded-2xl p-8 text-center space-y-6">
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

  // Deduce diagnostic LEDs based on prediction fatigue alerts
  const getFatigueDiagnostic = () => {
    if (!prediction) return { label: 'DIAGNOSTICS PENDING', color: 'bg-gray-500 shadow-gray-500/50' };
    const parts = prediction.likely_failures;
    if (parts.length >= 3) {
      return { label: 'CRITICAL ATTENTION', color: 'bg-red-500 shadow-red-500/80 animate-pulse' };
    } else if (parts.length > 0 && parts[0] !== 'General Tuning & Safety Check') {
      return { label: 'MAINTENANCE REQUIRED', color: 'bg-amber-500 shadow-amber-500/80 animate-pulse' };
    }
    return { label: 'DIAGNOSTICS: OPTIMAL', color: 'bg-emerald-500 shadow-emerald-500/80' };
  };

  const statusLed = getFatigueDiagnostic();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-gradient-to-b from-slate-950 to-slate-900 min-h-screen">
      
      {/* Hazard stripe accent header */}
      <div className="h-2 bg-repeating-linear-gradient from-yellow-500 to-yellow-500 via-slate-950 w-full rounded-t-lg bg-[linear-gradient(45deg,#f59e0b_25%,#0f172a_25%,#0f172a_50%,#f59e0b_50%,#f59e0b_75%,#0f172a_75%)] bg-[size:20px_20px] opacity-80"></div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <Wrench className="w-8 h-8 text-primary" />
            <span>Garage Diagnostic Terminal</span>
          </h1>
          <p className="text-gray-400 text-sm">Log repairs, track job cards, and query diagnostic telemetry in metric units.</p>
        </div>

        {/* Diagnostic Status Indicator LED */}
        <div className="flex items-center space-x-3 bg-slate-950 border border-dark-border px-4 py-2.5 rounded-xl shrink-0">
          <span className={`w-3.5 h-3.5 rounded-full shadow-lg ${statusLed.color}`}></span>
          <span className="text-[10px] font-black text-gray-300 tracking-wider uppercase">{statusLed.label}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Diagnostics Diagnostic Dashboard */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* OBD telemetry input */}
          <div className="bg-slate-900 border border-dark-border rounded-2xl p-6 shadow-md space-y-6 relative overflow-hidden">
            {/* Corner diagonal warning layout */}
            <div className="absolute top-0 right-0 bg-primary/10 border-l border-b border-dark-border py-1 px-3.5 text-[9px] font-black tracking-widest text-primary uppercase">
              OBD-II SCANNER
            </div>

            <h2 className="text-lg font-black text-white flex items-center space-x-2 uppercase tracking-tight">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Diagnostic Forecast Run</span>
            </h2>

            <form onSubmit={handleGetPrediction} className="flex gap-3">
              <div className="relative flex-grow">
                <Gauge className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="number"
                  required
                  placeholder="Enter current odometer reading (km)..."
                  value={currentMileage}
                  onChange={(e) => setCurrentMileage(e.target.value)}
                  className="w-full bg-slate-950 border border-dark-border rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-primary font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={predictLoading}
                className="bg-primary hover:bg-primary-hover text-white font-extrabold px-6 py-3.5 rounded-xl transition-colors shrink-0 text-xs uppercase tracking-wider flex items-center justify-center border border-orange-400/20"
              >
                {predictLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Scan Telemetry</span>}
              </button>
            </form>

            {predictError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg font-semibold">
                {predictError}
              </div>
            )}

            {/* Diagnostic readout report */}
            {prediction && (
              <div className="bg-slate-950 border border-dark-border p-5 rounded-xl space-y-6 animate-fade-in relative">
                {/* OBD screen details grid */}
                <div className="flex justify-between items-center text-xs text-gray-500 border-b border-dark-border/40 pb-2.5">
                  <span className="font-bold">SYSTEM SCAN REPORT: VER 1.4</span>
                  <span className="font-semibold text-primary">UNIT: IN_RUPEES</span>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-900 border border-dark-border/60 p-4 rounded-xl">
                    <Calendar className="w-4.5 h-4.5 mx-auto text-primary mb-1" />
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-wide">Next Service Date</p>
                    <p className="text-base font-black text-white mt-1">{prediction.next_service_date}</p>
                  </div>
                  <div className="bg-slate-900 border border-dark-border/60 p-4 rounded-xl">
                    <Gauge className="w-4.5 h-4.5 mx-auto text-primary mb-1" />
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-wide">Odometer Target</p>
                    <p className="text-base font-black text-white mt-1">{prediction.next_service_mileage.toLocaleString()} km</p>
                  </div>
                  <div className="bg-slate-900 border border-dark-border/60 p-4 rounded-xl">
                    <Flame className="w-4.5 h-4.5 mx-auto text-primary mb-1" />
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-wide">Estimated Invoice</p>
                    <p className="text-base font-black text-emerald-400 mt-1">₹{prediction.estimated_cost.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Fatigue Check alert blocks */}
                <div className="space-y-3 border-t border-dark-border/40 pt-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Fatigue Checklist Warnings:</p>
                  <div className="flex flex-wrap gap-2.5">
                    {prediction.likely_failures.map((f, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{f}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed pt-3 border-t border-dark-border/40 font-medium">
                  {prediction.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Service Timeline Job Cards */}
          <div className="bg-slate-900 border border-dark-border rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Active Garage Work Orders</h2>

            {recordsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : recordsError ? (
              <div className="text-xs text-rose-400 py-4 text-center">{recordsError}</div>
            ) : records.length === 0 ? (
              <p className="text-sm text-gray-500 py-10 text-center font-medium">
                No active work orders logged. Log a record using the right-hand panel.
              </p>
            ) : (
              <div className="relative border-l-2 border-dark-border ml-3.5 space-y-6 py-2">
                {records.map((rec) => (
                  <div key={rec.id} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1.5 bg-primary border-4 border-slate-900 w-4 h-4 rounded-full shadow-lg shadow-orange-500/35"></div>
                    
                    <div className="bg-slate-950/80 border border-dark-border/80 p-5 rounded-xl flex items-center justify-between hover:border-primary/40 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-white text-sm uppercase tracking-wide">{rec.service_type}</h4>
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest">
                            COMPLETED
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-400 font-semibold">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            <span>{rec.service_date}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Gauge className="w-3.5 h-3.5 text-gray-500" />
                            <span>{rec.mileage.toLocaleString()} km</span>
                          </span>
                        </div>
                      </div>
                      <span className="font-black text-emerald-400 shrink-0 ml-4 text-lg">
                        ₹{parseFloat(rec.cost).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Log Repair Form */}
        <div className="lg:col-span-4 bg-slate-900 border border-dark-border rounded-2xl p-6 shadow-md h-fit space-y-6">
          <h2 className="text-lg font-black text-white flex items-center space-x-1.5 border-b border-dark-border/40 pb-3 uppercase tracking-tight">
            <Plus className="w-5 h-5 text-primary" />
            <span>Create Job Card</span>
          </h2>

          {formError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-semibold">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateRecord} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Service Log Date</label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full bg-slate-950 border border-dark-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full bg-slate-950 border border-dark-border text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary"
              >
                {serviceChoices.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Odometer Mileage (km)</label>
              <input
                type="number"
                required
                placeholder="e.g. 5000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full bg-slate-950 border border-dark-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Service Cost (₹)</label>
              <input
                type="number"
                required
                step="0.01"
                placeholder="e.g. 1500"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-slate-950 border border-dark-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center"
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
