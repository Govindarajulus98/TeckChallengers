import React, { useState, useRef } from 'react';
import axios from "axios";
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { UploadCloud, Sparkles, Loader2, FileText, BarChart3, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);

      // Parse for frontend preview
      Papa.parse(selectedFile, {
        header: true,
        preview: 5,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setPreviewData({
              columns: Object.keys(results.data[0]),
              rows: results.data
            });
          }
        }
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      handleFileChange({ target: { files: [droppedFile] } });
    }
  };

  const loadExample = async () => {
    // Generate a simple CSV blob
    const csvContent = `Month,Sales,Expenses,Profit\nJan,4000,2400,1600\nFeb,3000,1398,1602\nMar,2000,9800,-7800\nApr,2780,3908,-1128\nMay,1890,4800,-2910\nJun,2390,3800,-1410\nJul,3490,4300,-810`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const exampleFile = new File([blob], 'financial_report_H1.csv', { type: 'text/csv' });
    handleFileChange({ target: { files: [exampleFile] } });
    setQuestion('Which month had the best profit and which had the worst?');
  };



  const handleAnalyze = async () => {

    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!file) {
      alert("Please upload a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);        // ⚠️ MUST be "file"
    formData.append("question", question);

    try {
      const res = await axios.post(
        "http://localhost:3001/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("API RESPONSE", res.data);
      console.log(result);
      setResult({
        insights: res.data.result,
        explanation: res.data.result,
        chartData: null
      });

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error occurred");
    }
    setLoading(false);
  };

  const renderChart = () => {
    if (!result || !result.chartData) return null;
    let { labels, values, chartLabel, chartType } = result.chartData;

    if (!labels || !values || labels.length === 0 || labels.length !== values.length) {
      return <div className="text-sm text-slate-400 italic mt-4">Data not structured correctly for visualization.</div>;
    }

    // Default to bar if invalid type is given
    if (chartType !== 'line' && chartType !== 'bar') {
      chartType = 'bar';
    }

    const data = {
      labels,
      datasets: [
        {
          label: chartLabel || 'Data View',
          data: values,
          backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo 500
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          borderRadius: chartType === 'bar' ? 4 : 0,
          tension: 0.3,
          fill: true,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: 'rgba(255, 255, 255, 0.8)' }
        },
        title: {
          display: true,
          text: chartLabel,
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          ticks: { color: 'rgba(255, 255, 255, 0.6)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        x: {
          ticks: { color: 'rgba(255, 255, 255, 0.6)' },
          grid: { display: false }
        }
      }
    };

    return (
      <div className="h-64 sm:h-80 w-full mt-4">
        {chartType === 'line' ? (
          <Line data={data} options={options} />
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header Section */}
        <header className="text-center space-y-4 pt-8 pb-4">
          <div className="inline-flex items-center justify-center p-3 glass-card rounded-xl mb-2 text-indigo-400 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Auto Data Analyst Agent
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload your CSV dataset, ask a question, and let AI reveal the hidden stories in your data instantly.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Input Form */}
          <div className="lg:col-span-4 space-y-6">
            <form onSubmit={handleAnalyze} className="glass-card p-6 space-y-6">

              <div className="flex justify-between items-center bg-slate-900/40 p-1 rounded-lg">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-3">Data Input</span>
                <button type="button" onClick={loadExample} className="text-xs bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 px-3 py-1.5 rounded-md transition-colors">
                  Load Demo Data
                </button>
              </div>

              {/* File Upload Component */}
              <div
                className="relative border-2 border-dashed border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/50 transition-colors cursor-pointer group flex flex-col items-center justify-center text-center backdrop-blur-sm bg-white/5"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-12 h-12 text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-semibold text-slate-200 mb-1">
                  {file ? file.name : "Upload CSV file"}
                </h3>
                <p className="text-sm text-slate-400">
                  {file ? "File ready" : "Drag & drop or browse"}
                </p>
              </div>

              {/* Data Preview */}
              {previewData && (
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 text-sm">
                  <div className="font-semibold text-slate-300 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-pink-400" /> Data Preview ({previewData.columns.length} cols)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {previewData.columns.slice(0, 5).map((col, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs truncate max-w-[100px] border border-slate-600/50">
                        {col}
                      </span>
                    ))}
                    {previewData.columns.length > 5 && <span className="text-slate-500 text-xs py-1">...</span>}
                  </div>
                </div>
              )}

              {/* Question Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">What would you like to know?</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Which region has the highest sales?"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 resize-none h-24"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Analyze Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Data...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Run Analysis Magic
                    </>
                  )}
                </span>
              </button>

            </form>
          </div>

          {/* Right Column: Dashboard Layout */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {loading && !result ? (
              <div className="glass-card flex-1 flex flex-col items-center justify-center min-h-[400px] border-indigo-500/20">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-[50px] opacity-20 rounded-full animate-pulse"></div>
                  <Loader2 className="w-16 h-16 text-indigo-400 animate-spin relative z-10" />
                </div>
                <p className="mt-6 text-lg font-medium text-indigo-300 animate-pulse">
                  AI is exploring your data...
                </p>
                <p className="text-sm text-slate-500 mt-2">Extracting insights and crafting charts</p>
              </div>
            ) : result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Insights Card */}
                <div className="glass-card p-6 border-t-4 border-t-pink-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl"></div>
                  <h3 className="text-xl font-bold mb-4 flex items-center text-pink-400">
                    <Sparkles className="w-5 h-5 mr-2" /> Executive Insights
                  </h3>
                  <div className="text-slate-200 leading-relaxed text-lg">
                    {result.insights}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Chart Card */}
                  <div className="glass-card p-6 md:col-span-2 border-t-4 border-t-indigo-500">
                    <h3 className="text-lg font-bold mb-2 flex items-center text-indigo-400">
                      <BarChart3 className="w-5 h-5 mr-2" /> Data Visualization
                    </h3>
                    <div className="w-full">
                      {renderChart()}
                    </div>
                  </div>

                  {/* AI Explanation Card */}
                  <div className="glass-card p-6 md:col-span-2 border-t-4 border-t-purple-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 -mt-8 -ml-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
                    <h3 className="text-lg font-bold mb-3 flex items-center text-purple-400">
                      <AlertCircle className="w-5 h-5 mr-2" /> AI Explanation
                    </h3>
                    <div className="text-slate-300 leading-relaxed p-4 bg-purple-500/5 rounded-xl border border-purple-500/10 shadow-inner">
                      {result.explanation}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="glass-card flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-dashed border-2 border-white/10 opacity-70">
                <BarChart3 className="w-20 h-20 text-slate-600 mb-6" />
                <h2 className="text-2xl font-bold text-slate-300 mb-2">Awaiting Data</h2>
                <p className="text-slate-500 max-w-md">
                  Upload a dataset and ask your question on the left to see the AI generate insights, explanations, and charts right here.
                </p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
