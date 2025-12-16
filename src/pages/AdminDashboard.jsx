import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Users, FileSpreadsheet, CheckCircle, AlertCircle, ChevronRight, BarChart, TrendingUp, PhoneCall, Play } from 'lucide-react';
import StatusToggle from '../components/StatusToggle';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  
  // Stats State (For Lead Counts & Performance)
  const [myLeadCount, setMyLeadCount] = useState(0);
  const [performance, setPerformance] = useState({
    calls: 0,
    conversions: 0,
    earnings: 0
  });

  // Distribution State (For Managers)
  const [subordinates, setSubordinates] = useState([]);
  const [distributions, setDistributions] = useState({});

  const role = localStorage.getItem('role');
  const isAdmin = role === 'Admin';
  const isEmployee = role === 'Employee';

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Get Stats (Works for everyone)
      const statsRes = await api.get('/leads/stats');
      
      // Set Available Leads
      setMyLeadCount(statsRes.data.availableLeads);
      
      // Set Performance Stats (For Employees)
      setPerformance({
        calls: statsRes.data.callsToday || 0,
        conversions: statsRes.data.conversions || 0,
        earnings: statsRes.data.estimatedEarnings || 0
      });

      // 2. Get Subordinates (Only if NOT Employee)
      if (!isEmployee) {
        const subRes = await api.get('/auth/subordinates');
        setSubordinates(subRes.data);
        
        // Initialize distribution inputs to 0
        const initialDist = {};
        subRes.data.forEach(sub => initialDist[sub._id] = 0);
        setDistributions(initialDist);
      }

    } catch (err) {
      console.error("Error loading dashboard data");
      // If Gatekeeper blocks (403), show warning (Except for Admin who is immune)
      if (err.response?.status === 403 && !isAdmin) {
        setMsg({ text: "Please Click 'Online' above to Start Your Day!", type: 'error' });
      }
    }
  };

  // --- HANDLERS ---

  // Handle File Upload (ADMIN ONLY)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMsg({ text: 'Please select a file.', type: 'error' });
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoading(true);
      const res = await api.post('/leads/upload', formData);
      setMsg({ text: res.data.msg, type: 'success' });
      fetchDashboardData();
    } catch (err) {
      setMsg({ text: err.response?.data?.msg || "Upload Failed", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Distribution Handlers (MANAGERS ONLY)
  const handleInputChange = (userId, value) => {
    setDistributions(prev => ({ ...prev, [userId]: parseInt(value) || 0 }));
  };

  const handleEqualSplit = () => {
    if (subordinates.length === 0 || myLeadCount === 0) return;
    const perPerson = Math.floor(myLeadCount / subordinates.length);
    const newDist = {};
    subordinates.forEach(sub => newDist[sub._id] = perPerson);
    setDistributions(newDist);
  };

  const handleDistribute = async () => {
    const assignments = Object.entries(distributions).map(([userId, count]) => ({ userId, count }));
    const totalRequested = assignments.reduce((acc, curr) => acc + curr.count, 0);

    if (totalRequested > myLeadCount) {
      setMsg({ text: `Error: You only have ${myLeadCount} leads, but tried to send ${totalRequested}.`, type: 'error' });
      return;
    }
    if (totalRequested === 0) {
      setMsg({ text: "Please assign at least one lead.", type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/leads/distribute', { assignments });
      setMsg({ text: res.data.msg, type: 'success' });
      fetchDashboardData(); 
      const reset = {};
      subordinates.forEach(s => reset[s._id] = 0);
      setDistributions(reset);
    } catch (err) {
      setMsg({ text: err.response?.data?.msg || "Distribution Failed", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      {/* 1. STATUS TOGGLE (Visible to Everyone EXCEPT Admin) */}
      {!isAdmin && <StatusToggle />}

      <h1 className="text-3xl font-bold text-brand-dark mb-2">
        {role} Dashboard
      </h1>
      <p className="text-gray-500 mb-8">
        {isEmployee ? "Track your daily performance." : "Manage your team and lead distribution."}
      </p>

      {msg.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {msg.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- LEFT COLUMN --- */}
        {isAdmin ? (
          // A. ADMIN: Upload Box
          <div className="bg-white rounded-xl shadow-lg border-t-4 border-brand-medium p-6">
            <div className="flex items-center gap-3 mb-4 text-brand-dark">
              <UploadCloud size={24} />
              <h2 className="text-xl font-bold">Data Ingestion</h2>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-gray-400">
                  <FileSpreadsheet className="mx-auto mb-2" size={32} />
                  <span className="text-sm font-medium text-brand-medium">
                    {file ? file.name : "Click or Drag Excel File Here"}
                  </span>
                </div>
              </div>
              <button type="submit" disabled={loading || !file} className="w-full bg-brand-medium hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition disabled:opacity-50">
                {loading ? 'Processing...' : 'Upload Data'}
              </button>
            </form>
          </div>
        ) : isEmployee ? (
          // B. EMPLOYEE: Personal Performance Stats (Now Linked to Real Data)
          <div className="bg-white rounded-xl shadow-lg border-t-4 border-green-600 p-6">
            <div className="flex items-center gap-3 mb-6 text-brand-dark">
              <TrendingUp size={24} />
              <h2 className="text-xl font-bold">My Performance</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-500 mb-1">Calls Today</p>
                <p className="text-2xl font-bold text-blue-700">{performance.calls}</p> 
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-gray-500 mb-1">Conversions</p>
                <p className="text-2xl font-bold text-green-700">{performance.conversions}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 col-span-2">
                <p className="text-sm text-gray-500 mb-1">Est. Earnings</p>
                <p className="text-3xl font-bold text-purple-700">
                  ₹{performance.earnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // C. MANAGER: Team Stats
          <div className="bg-white rounded-xl shadow-lg border-t-4 border-brand-medium p-6">
            <div className="flex items-center gap-3 mb-4 text-brand-dark">
              <BarChart size={24} />
              <h2 className="text-xl font-bold">Team Overview</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Active Team Members</p>
                <p className="text-3xl font-bold text-brand-dark">{subordinates.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- RIGHT COLUMN --- */}
        {isEmployee ? (
          // A. EMPLOYEE: Workstation (Queue Button)
          <div className="bg-white rounded-xl shadow-lg border-t-4 border-brand-light p-6">
            <div className="flex items-center gap-3 mb-4 text-brand-dark">
              <PhoneCall size={24} />
              <h2 className="text-xl font-bold">Workstation</h2>
            </div>
            
            <p className="text-gray-500 text-sm mb-6">
              You have <span className="font-bold text-brand-dark text-lg">{myLeadCount}</span> pending leads to call.
            </p>

            <button 
              onClick={() => navigate('/my-leads')} 
              className="w-full bg-brand-medium text-white py-4 rounded-lg font-bold mb-6 hover:bg-brand-dark transition shadow-md flex justify-center items-center gap-2"
            >
              <Play size={20} fill="white" />
              Start Dialer Queue
            </button>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              <p className="font-bold mb-1">Daily Checklist:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Use the toggle above to mark "Break" or "Lunch".</li>
                <li>Log every call outcome accurately.</li>
                <li>Convert interested leads to Clients immediately.</li>
              </ul>
            </div>
          </div>
        ) : (
          // B. MANAGER/ADMIN: Distribution Logic
          <div className="bg-white rounded-xl shadow-lg border-t-4 border-brand-light p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-2 text-brand-dark">
              <Users size={24} />
              <h2 className="text-xl font-bold">Lead Distribution</h2>
            </div>
            
            <div className="bg-brand-bg p-3 rounded-lg mb-4 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600">Your Available Pool:</span>
              <span className="text-2xl font-bold text-brand-dark">{myLeadCount}</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[300px] mb-4 pr-2">
              {subordinates.length === 0 ? (
                <p className="text-gray-400 text-center py-10">
                  No team members found.<br/>
                  <span className="text-xs">Go to "Add Member" to build your team.</span>
                </p>
              ) : (
                <div className="space-y-3">
                  {subordinates.map(sub => (
                    <div key={sub._id} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-700 text-sm">{sub.name}</p>
                        <p className="text-xs text-gray-400">{sub.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Amount:</span>
                        <input 
                          type="number" 
                          min="0"
                          className="w-20 p-2 border rounded text-center font-bold text-brand-dark focus:ring-2 focus:ring-brand-medium outline-none"
                          value={distributions[sub._id]}
                          onChange={(e) => handleInputChange(sub._id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-auto space-y-3">
              <button 
                onClick={handleEqualSplit}
                className="w-full py-2 text-brand-medium font-bold text-sm border border-brand-medium rounded hover:bg-brand-bg transition"
              >
                Auto-Split Equally
              </button>
              <button 
                onClick={handleDistribute}
                disabled={loading || myLeadCount === 0 || subordinates.length === 0}
                className="w-full bg-brand-light hover:bg-brand-medium text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Distributing...' : 'Confirm Distribution'}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;