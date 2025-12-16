import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Phone, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads/my-leads');
      setLeads(res.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 403) {
        setError("ACCESS DENIED: You must Clock In to access data.");
      } else {
        setError("Failed to load leads.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">{error}</h2>
        
        {/* FIX: Send user to Dashboard to use the Status Widget */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-brand-medium text-white px-6 py-2 rounded-lg hover:bg-brand-dark transition shadow-lg"
        >
          Go to Dashboard & Clock In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-dark mb-6">My Assigned Leads</h1>
      
      {loading ? (
        <p>Loading data...</p>
      ) : leads.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">No leads found. Ask your manager to distribute data.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-brand-light text-white">
              <tr>
                <th className="p-4 font-semibold">Phone Number</th>
                <th className="p-4 font-semibold">Name / Source</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Assigned Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr 
                  key={lead._id} 
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate('/lead-details', { state: { lead } })} 
                >
                  <td className="p-4 font-mono text-brand-medium font-bold">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      {lead.phoneNumber}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{lead.name}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      lead.status === 'New' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyLeads;