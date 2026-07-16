import React, { useState, useEffect, useContext } from 'react';
import { ridingStyleApi } from '../api/ridingStyleApi';
import { AuthContext } from '../context/AuthContext';
import { Activity, Upload, Loader2, Sparkles, AlertTriangle, ShieldCheck, Download, Calendar, ShieldAlert } from 'lucide-react';
import BikeLoader from '../components/BikeLoader';

const RidingStyleAnalyzer = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // Upload logs history state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  // File upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // Latest result state
  const [analysisResult, setAnalysisResult] = useState(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await ridingStyleApi.getHistory();
      setHistory(data.results || data);
    } catch (err) {
      setHistoryError("Could not retrieve upload history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
    setUploadError(null);
    setAnalysisResult(null);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    // Client-side validation: Max file size 5MB
    if (uploadFile.size > 5 * 1024 * 1024) {
      setUploadError("CSV file size exceeds the 5MB limit.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const data = await ridingStyleApi.uploadRideData(uploadFile);
      setAnalysisResult(data);
      setUploadFile(null); // Clear selected file
      fetchHistory(); // Refresh history timeline
    } catch (err) {
      setUploadError(err.response?.data?.error || "Analysis failed. Please verify that the CSV format is correct.");
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 bg-dark-surface border border-dark-border rounded-2xl p-8 text-center space-y-6">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Authentication Required</h2>
        <p className="text-sm text-gray-400">You must sign in to upload telemetry data and access your ride style history.</p>
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

  const getStyleColor = (style) => {
    switch (style) {
      case 'Calm':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'Moderate':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'Aggressive':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-white">Riding Style Classifier</h1>
          <p className="text-gray-400 text-sm">Upload speed and acceleration sensor metrics (CSV) to analyze safety behavior.</p>
        </div>
        
        {/* Template download link */}
        <a
          href={ridingStyleApi.getTemplateDownloadUrl()}
          download
          className="inline-flex items-center space-x-2 bg-dark-surface border border-dark-border hover:border-gray-500 text-gray-300 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all w-fit"
        >
          <Download className="w-4 h-4 text-primary" />
          <span>Download CSV Template</span>
        </a>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Upload file and view Analysis */}
        <div className="lg:col-span-8 space-y-8">
          {/* Telemetry Upload panel */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Upload className="w-5 h-5 text-primary" />
              <span>Upload Ride Telemetry Log</span>
            </h2>

            {!uploading ? (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-dark-border hover:border-primary/50 rounded-2xl p-8 text-center bg-dark-bg/20 transition-colors flex flex-col items-center justify-center space-y-2 relative">
                  <Upload className="w-10 h-10 text-gray-500 mb-2" />
                  <p className="text-sm font-bold text-white">
                    {uploadFile ? uploadFile.name : 'Drag and drop your CSV ride log here'}
                  </p>
                  <p className="text-xs text-gray-500">Only CSV files under 5MB are permitted.</p>
                  
                  <label className="bg-dark-border hover:bg-dark-border/80 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold mt-4 cursor-pointer transition-colors">
                    <span>Browse File</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!uploadFile}
                  className="w-full bg-primary hover:bg-primary-hover disabled:bg-gray-600 text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center"
                >
                  <span>Upload and Classify</span>
                </button>
              </form>
            ) : (
              <div className="py-6">
                <BikeLoader message="Uploading and Classifying Telemetry..." />
              </div>
            )}
          </div>

          {/* Style Classifier Results */}
          {analysisResult && (
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-md space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-dark-border/40 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>AI Riding Assessment Results</span>
                </h3>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-wider ${getStyleColor(analysisResult.riding_style)}`}>
                  {analysisResult.riding_style} Style
                </span>
              </div>

              {/* Statistics feature metrics */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Extracted Ride Metrics:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-dark-bg/60 border border-dark-border p-4 rounded-xl">
                    <p className="text-xs font-black text-white">{analysisResult.features.avg_speed} km/h</p>
                    <p className="text-[10px] text-gray-500 uppercase mt-1">Average Speed</p>
                  </div>
                  <div className="bg-dark-bg/60 border border-dark-border p-4 rounded-xl">
                    <p className="text-xs font-black text-white">{analysisResult.features.max_speed} km/h</p>
                    <p className="text-[10px] text-gray-500 uppercase mt-1">Maximum Speed</p>
                  </div>
                  <div className="bg-dark-bg/60 border border-dark-border p-4 rounded-xl">
                    <p className="text-xs font-black text-white">{analysisResult.features.accel_variance}</p>
                    <p className="text-[10px] text-gray-500 uppercase mt-1">Accel Variance</p>
                  </div>
                  <div className="bg-dark-bg/60 border border-dark-border p-4 rounded-xl">
                    <p className="text-xs font-black text-white">{analysisResult.features.harsh_braking_count}</p>
                    <p className="text-[10px] text-gray-500 uppercase mt-1">Harsh Braking</p>
                  </div>
                </div>
              </div>

              {/* Actionable suggestions */}
              <div className="space-y-3 border-t border-dark-border/40 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Actionable AI Suggestions:</p>
                <ul className="text-xs text-gray-300 space-y-2 list-disc pl-4 leading-relaxed">
                  {analysisResult.suggestions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Upload History list */}
        <div className="lg:col-span-4 bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-md h-fit space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-dark-border/40 pb-3">
            Analysis Logs History
          </h2>

          {historyLoading ? (
            <BikeLoader message="Loading logs..." />
          ) : historyError ? (
            <div className="text-xs text-rose-400 py-2">{historyError}</div>
          ) : history.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No ride logs uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="bg-dark-bg/40 border border-dark-border/60 p-3.5 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>{new Date(h.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-bold text-white truncate max-w-[150px]" title={h.uploaded_file_ref}>
                      {h.uploaded_file_ref.split('/').pop()}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${getStyleColor(h.riding_style)}`}>
                    {h.riding_style}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RidingStyleAnalyzer;
