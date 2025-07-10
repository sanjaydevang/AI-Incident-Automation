import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, Search, FileWarning, Wand2, Database, ServerCrash, MessageSquare, AlertTriangle, CheckSquare, Siren, ShieldAlert, Library, RefreshCw, Share2, Tag, Paperclip, ArrowDown, ArrowUp, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Mock Data (for static UI elements) ---
const mockMetrics = {
  activeP1: 1,
  activeP2: 3,
  activeP3: 8,
  mttr: '2.3h',
};

const mockServices = [
    { name: 'API Gateway', health: '99.9%', color: 'text-green-400', sparkline: "0,25 10,20 20,22 30,15 40,18 50,10 60,12 70,5 80,8" },
    { name: 'Database', health: '95.2%', color: 'text-red-500', sparkline: "0,5 10,8 20,12 30,10 40,15 50,20 60,25 70,28 80,25" },
    { name: 'Prod Server', health: '99.8%', color: 'text-green-400', sparkline: "0,15 10,12 20,18 30,15 40,16 50,14 60,15 70,12 80,14" },
    { name: 'Cache Service', health: '98.1%', color: 'text-orange-400', sparkline: "0,20 10,22 20,18 30,25 40,22 50,28 60,25 70,26 80,20" },
];

const mockOnCall = [
    { service: 'API Services', primary: 'Alice', secondary: 'Bob' },
    { service: 'Databases', primary: 'Charlie', secondary: 'Dana' },
];


// --- UI Components ---

const Sidebar = ({ metrics }) => (
    <aside className="w-72 bg-slate-900 text-slate-400 p-6 flex flex-col shrink-0 border-r border-slate-800">
        <div className="flex items-center gap-3 mb-10">
            <Bot className="w-8 h-8 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">AIOps Co-pilot</h1>
        </div>
        
        <nav className="space-y-6 flex-grow">
            {/* Incident Tracker */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-slate-200">Active Incidents</h3>
                    <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
                        <button className="flex-1 text-xs py-1 px-2 rounded-md bg-indigo-600 text-white">1W</button>
                        <button className="flex-1 text-xs py-1 px-2 text-slate-400 hover:bg-slate-700 rounded-md">1M</button>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div><p className="text-2xl font-bold text-red-500">{metrics.activeP1}</p><p className="text-xs text-slate-400">P1</p></div>
                    <div><p className="text-2xl font-bold text-orange-400">{metrics.activeP2}</p><p className="text-xs text-slate-400">P2</p></div>
                    <div><p className="text-2xl font-bold text-yellow-400">{metrics.activeP3}</p><p className="text-xs text-slate-400">P3</p></div>
                </div>
                <div className="h-24">
                    <svg width="100%" height="100%" viewBox="0 0 250 100" preserveAspectRatio="none">
                        <polyline fill="rgba(139, 92, 246, 0.1)" stroke="#8b5cf6" strokeWidth="2" points="0,60 50,40 100,50 150,20 200,30 250,10" />
                    </svg>
                </div>
            </div>

            {/* Other Metrics */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-400">MTTR (Last 24h)</p>
                <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-bold text-white">{metrics.mttr}</p>
                    <span className="text-xs text-green-400 flex items-center"><ArrowDown className="w-3 h-3" />15%</span>
                </div>
            </div>
            
            {/* On-Call Schedule */}
            <div className="pt-2">
                <p className="text-sm font-semibold text-slate-300 mb-2">On-Call Schedule</p>
                <div className="space-y-3">
                    {mockOnCall.map(schedule => (
                        <div key={schedule.service} className="text-xs p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                            <p className="font-bold text-white">{schedule.service}</p>
                            <p>Primary: <span className="text-indigo-300">{schedule.primary}</span></p>
                            <p>Secondary: <span className="text-slate-400">{schedule.secondary}</span></p>
                        </div>
                    ))}
                </div>
            </div>
        </nav>
        
        <div className="mt-6 border-t border-slate-700 pt-6">
            <div className="flex items-center">
                <img className="h-10 w-10 rounded-full" src="https://placehold.co/100x100/8b5cf6/ffffff?text=S" alt="User avatar" />
                <div className="ml-3">
                    <p className="text-sm font-medium text-white">Sanjay Devang</p>
                    <p className="text-xs text-slate-400">On-Call Engineer</p>
                </div>
            </div>
        </div>
    </aside>
);

const ServiceHealthCard = ({ service }) => (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg flex justify-between items-center">
        <div>
            <p className="text-sm font-medium text-slate-400">{service.name}</p>
            <p className={`text-2xl font-bold ${service.color}`}>{service.health}</p>
        </div>
        <svg width="80" height="30"><polyline fill="none" stroke={service.color.includes('green') ? '#22c55e' : service.color.includes('red') ? '#ef4444' : '#f97316'} strokeWidth="2" points={service.sparkline}></polyline></svg>
    </div>
);

const AnalysisForm = ({ onSubmit, description, setDescription, isLoading, file, handleFileChange, handleAttachClick, fileInputRef }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Triage & Analyze</h2>
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="description" className="block text-sm font-medium text-slate-300">Incident Description or Log Snippet</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button type="button" onClick={handleAttachClick} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center">
                        <Paperclip className="w-4 h-4 mr-1" />
                        {file ? file.name : 'Attach File'}
                    </button>
                </div>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows="8" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Paste logs or describe the issue..."></textarea>
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-500 disabled:cursor-not-allowed">
                {isLoading ? <Settings className="animate-spin w-5 h-5 mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
                {isLoading ? 'Analyzing...' : 'Get AI Analysis'}
            </button>
        </form>
    </div>
);

const AnalysisResults = ({ results, isLoading }) => {
    if (isLoading) {
        return (
             <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/2 mb-6"></div>
                <div className="space-y-4">
                    <div className="h-24 bg-slate-700 rounded"></div>
                    <div className="h-20 bg-slate-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-center h-full">
                <Search className="w-16 h-16 text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-300">Analysis Results</h3>
                <p className="text-sm text-slate-400">Results from your analysis will appear here.</p>
            </div>
        );
    }

    if (results.type === 'error') {
        return (
            <div className="bg-slate-800/50 p-6 rounded-lg border border-red-500/30">
                <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" />Analysis Failed</h2>
                <p className="text-slate-300 bg-red-500/10 p-4 rounded-md">{results.message}</p>
            </div>
        );
    }

    const { search, analysis } = results.data;

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Analysis Results</h2>
            <div className="space-y-6">
                {analysis && (
                    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <h3 className="font-semibold text-lg mb-3 text-white">AI Analysis</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-400">Probable Category:</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20`}>
                                    <Tag className="w-4 h-4 mr-2" />{analysis.category}
                                </span>
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-400 mb-1">Summary:</h4>
                                <p className="text-slate-300">{analysis.summary}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-400 mb-1">Probable Cause:</h4>
                                <p className="text-slate-300">{analysis.probable_cause}</p>
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-lg text-white border-t border-slate-700 pt-6">Similar Historical Incidents</h3>
                    <ul className="divide-y divide-slate-700 mt-2">
                        {search?.results?.length > 0 ? (
                            search.results.map((item, index) => (
                                <li key={index} className="py-3">
                                    <p className="font-medium text-slate-300">{item.document.title}</p>
                                    <p className="text-sm text-slate-400">Similarity Score: {item.similarity_score.toFixed(4)}</p>
                                </li>
                            ))
                        ) : (
                            <p className="text-slate-400 text-sm mt-2">No similar incidents found.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};


function App() {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const API_URL = "http://localhost:8000";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      let query = description;

      if (file) {
          try {
              query = await file.text();
          } catch (readError) {
              setAnalysisResult({ type: 'error', message: 'Could not read the uploaded file.' });
              return;
          }
      }

      if (!query) {
        alert("Please provide an incident description or attach a log file.");
        return;
      }

      setIsLoading(true);
      setAnalysisResult(null);

      try {
        const [searchRes, analysisRes] = await Promise.all([
            fetch(`${API_URL}/search-incidents/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            }),
            fetch(`${API_URL}/analyze-incident-details/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            }),
        ]);

        if (!searchRes.ok || !analysisRes.ok) {
            const errorData = !searchRes.ok ? await searchRes.json() : await analysisRes.json();
            throw new Error(errorData.detail || 'An API error occurred.');
        }
        
        const searchData = await searchRes.json();
        const analysisData = await analysisRes.json();
        
        setAnalysisResult({ type: 'success', data: { search: searchData, analysis: analysisData.analysis } });

      } catch (error) {
          setAnalysisResult({ type: 'error', message: error.toString() });
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-300">
        <Sidebar metrics={mockMetrics} />
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
                <div className="flex items-center gap-4">
                     <div className="relative">
                        <Search className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search knowledge base..." className="bg-slate-800 text-slate-300 rounded-md pl-9 pr-3 py-2 text-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                     </div>
                     <button className="flex items-center py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
                        <FileWarning className="w-5 h-5 mr-2" />
                        Declare Incident
                    </button>
                </div>
            </header>

            <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-200 mb-4">Service Health (Last Hour)</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mockServices.map(service => <ServiceHealthCard key={service.name} service={service} />)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AnalysisForm 
                    onSubmit={handleSubmit}
                    description={description}
                    setDescription={setDescription}
                    isLoading={isLoading}
                    file={file}
                    handleFileChange={handleFileChange}
                    handleAttachClick={handleAttachClick}
                    fileInputRef={fileInputRef}
                />
                <AnalysisResults 
                    results={analysisResult}
                    isLoading={isLoading}
                />
            </div>
        </main>
    </div>
  );
}

export default App;
