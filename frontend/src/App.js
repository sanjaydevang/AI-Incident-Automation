import React, { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, Settings, RefreshCw, Search, Link as LinkIcon, AlertCircle } from 'lucide-react';

// --- Helper Components ---

const StatusDot = ({ color }) => (
  <span className={`w-3 h-3 rounded-full inline-block mr-2 ${color}`}></span>
);

const StatusBar = ({ backendStatus, onSync, isSyncing, totalDocs }) => (
  <div className="bg-slate-100 p-3 rounded-lg mb-6 text-sm text-slate-600 flex justify-between items-center shadow-sm">
    <div className="flex items-center">
      <span className="font-semibold mr-6 flex items-center">
        {backendStatus === 'Online' ? <StatusDot color="bg-green-500" /> : <StatusDot color="bg-red-500" />}
        Backend: {backendStatus}
      </span>
      <span className="font-semibold mr-6 flex items-center">
        {totalDocs > 0 ? <StatusDot color="bg-green-500" /> : <StatusDot color="bg-yellow-500" />}
        Knowledge Base: {totalDocs > 0 ? `${totalDocs} documents indexed` : 'Not Synced'}
      </span>
    </div>
    <div className="flex items-center">
      <button
        onClick={onSync}
        disabled={isSyncing || backendStatus !== 'Online'}
        className="flex items-center px-3 py-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-200"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Sync Data'}
      </button>
    </div>
  </div>
);

const SearchResults = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
          <Search className="mr-3 text-indigo-500" />
          Analyzing...
        </h2>
        <div className="flex justify-center items-center p-8">
          <Settings className="w-12 h-12 text-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!results) return null;
  
  if (results.type === 'error') {
    return (
       <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-red-600 mb-4 flex items-center">
          <AlertCircle className="mr-3" />
          Analysis Failed
        </h2>
        <p className="text-slate-600 bg-red-50 p-4 rounded-md">{results.message}</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
        <Search className="mr-3 text-indigo-500" />
        Analysis Results
      </h2>
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Similar Historical Incidents:</h3>
        {results.data?.results?.length > 0 ? (
          <ul className="divide-y divide-slate-200">
            {results.data.results.map((item, index) => (
              <li key={index} className="py-3">
                <p className="font-medium text-slate-800">{item.document.title}</p>
                <p className="text-sm text-slate-500">
                  Similarity Score: {item.similarity_score.toFixed(4)}
                </p>
                {item.document.url.startsWith('http') ? (
                   <a href={item.document.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center">
                     <LinkIcon className="w-4 h-4 mr-1" /> View Document
                   </a>
                ) : (
                   <p className="text-sm text-slate-500 flex items-center"><FileText className="w-4 h-4 mr-1" />{item.document.url}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">No similar incidents found in the knowledge base.</p>
        )}
      </div>
    </div>
  );
};


// --- Main App Component ---

function App() {
  // --- State Management ---
  const [incidentTitle, setIncidentTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [isSyncing, setIsSyncing] = useState(false);
  const [totalDocs, setTotalDocs] = useState(0);

  const API_URL = "http://localhost:8000";

  // --- Handlers ---

  const handleSyncData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${API_URL}/sync-local-data/`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to sync');
      }
      
      setTotalDocs(data.total_pages_in_store || 0);
      alert(`Sync successful! Indexed ${data.pages_added} documents.`);

    } catch (error) {
      alert(`Sync Error: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let query = description || incidentTitle;

    if (file) {
      try {
        // Read file content as text. This is asynchronous.
        query = await file.text();
      } catch (readError) {
        setAnalysisResult({ type: 'error', message: 'Could not read the uploaded file.' });
        return;
      }
    }

    if (!query) {
      alert('Please provide an incident title, description, or a log file for analysis.');
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch(`${API_URL}/search-incidents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAnalysisResult({ type: 'success', data });
    } catch (error) {
      setAnalysisResult({ type: 'error', message: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Effects ---

  useEffect(() => {
    fetch(API_URL)
      .then(response => response.ok ? setBackendStatus('Online') : setBackendStatus('Offline'))
      .catch(() => setBackendStatus('Offline'));
  }, []);


  // --- Drag and Drop Handlers ---
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };


  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8">
        
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
            AI Incident Analyst
          </h1>
          <p className="text-lg text-slate-500">
            Analyze incidents using historical data and AI-powered insights
          </p>
        </header>

        <StatusBar 
          backendStatus={backendStatus}
          onSync={handleSyncData}
          isSyncing={isSyncing}
          totalDocs={totalDocs}
        />

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* --- Left Column: Form & Upload --- */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
                <FileText className="mr-3 text-indigo-500" />
                Report New Incident
              </h2>
              <div className="space-y-4">
                  <div>
                    <label htmlFor="incidentTitle" className="block text-sm font-medium text-slate-700 mb-1">Incident Title</label>
                    <input type="text" id="incidentTitle" value={incidentTitle} onChange={e => setIncidentTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., API Gateway 502 Errors" />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows="4" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Describe the issue..."></textarea>
                  </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
                <Upload className="mr-3 text-indigo-500" />
                Upload Logs (Optional)
              </h2>
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-200 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'}`}
              >
                <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-2 text-slate-600">
                    {file ? `Selected: ${file.name}` : 'Drag & drop log files here or click to browse'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Analysis will prioritize file content if provided.</p>
                </label>
              </div>
            </div>
          </div>

          {/* --- Right Column: Actions & Results --- */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Actions</h2>
                 <button
                    onClick={handleSubmit}
                    disabled={isLoading || backendStatus !== 'Online'}
                    className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Settings className="animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : 'Analyze Incident'}
                  </button>
             </div>
            <SearchResults results={analysisResult} isLoading={isLoading} />
          </div>

        </main>
      </div>
    </div>
  );
}

export default App;
