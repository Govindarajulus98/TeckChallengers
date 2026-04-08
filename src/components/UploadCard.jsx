import { useState } from 'react';
import { Upload, FileText, X, Sparkles } from 'lucide-react';

export default function UploadCard({ onAnalyze, isLoading }) {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleAnalyze = () => {
    if (file && role) {
      onAnalyze({ file, role });
    }
  };

  return (
    <div className="glass-card rounded-3xl shadow-xl p-10 md:p-12 max-w-2xl mx-auto transform transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:scale-[1.01] border border-gray-200/60">
      {/* Card Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
          <Upload className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Upload Your Data</h2>
          <p className="text-sm text-gray-400 mt-0.5">Upload a CSV file to begin analysis</p>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-400 cursor-pointer
          ${isDragging
            ? 'border-indigo-500 bg-indigo-50/60 scale-[1.02] shadow-lg shadow-indigo-500/10'
            : 'border-gray-300/80 hover:border-indigo-400 hover:bg-indigo-50/30 hover:shadow-md'
          }
        `}
      >
        {file ? (
          <div className="flex items-center justify-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-800">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 hover:bg-red-100 rounded-full transition-all duration-300 group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        ) : (
          <>
            <div className="transform transition-all duration-300 hover:scale-110 hover:-translate-y-1">
              <Upload className="w-16 h-16 text-indigo-400/70 mx-auto mb-5" />
            </div>
            <p className="text-gray-700 mb-2 text-lg font-medium">
              <span className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Click to upload</span>{' '}
              or drag and drop
            </p>
            <p className="text-sm text-gray-400">CSV files only (max 10MB)</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </>
        )}
      </div>

      {/* Role Selection */}
      <div className="mt-8">
        <label className="block text-sm font-semibold text-gray-600 mb-3 tracking-wide uppercase">
          I am a
        </label>
        <div className="relative">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all duration-300 bg-white/80 text-gray-700 font-medium hover:border-indigo-300 hover:shadow-sm appearance-none cursor-pointer"
          >
            <option value="">Select your role</option>
            <option value="student">📚 Student</option>
            <option value="founder">🚀 Founder</option>
            <option value="analyst">📊 Analyst</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!file || !role || isLoading}
        className={`
          w-full mt-10 py-4 px-6 rounded-xl font-semibold text-lg
          transition-all duration-300 transform cursor-pointer
          ${!file || !role || isLoading
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.03] shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-[0.98]'
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing Data...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Analyze Data
          </span>
        )}
      </button>
    </div>
  );
}
