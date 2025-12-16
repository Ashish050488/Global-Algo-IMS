import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { FileSpreadsheet, Calendar, ChevronRight, X } from 'lucide-react';

const UploadHistory = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null); // ID of clicked file
  const [batchLeads, setBatchLeads] = useState([]); // Data of clicked file
  const [loading, setLoading] = useState(false);

  // 1. Load List of Files on Mount
  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const res = await api.get('/leads/batches');
      setBatches(res.data);
    } catch (err) {
      console.error("Error loading batches");
    }
  };

  // 2. Load Numbers when File is Clicked
  const handleBatchClick = async (batchId) => {
    setLoading(true);
    try {
      const res = await api.get(`/leads/batch/${batchId}`);
      setBatchLeads(res.data);
      setSelectedBatch(batchId);
    } catch (err) {
      alert("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex gap-6 h-[80vh]">
      
      {/* LEFT PANEL: File List */}
      <div className="w-1/3 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="p-4 bg-brand-dark text-white border-b border-brand-light">
          <h2 className="font-bold flex items-center gap-2">
            <FileSpreadsheet size={20} /> Upload History
          </h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {batches.map((batch) => (
            <div 
              key={batch._id}
              onClick={() => handleBatchClick(batch._id)}
              className={`p-4 rounded-lg cursor-pointer transition border border-gray-100 hover:shadow-md ${
                selectedBatch === batch._id ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800 text-sm truncate w-40">{batch.fileName}</h3>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {batch.totalCount} Leads
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <Calendar size={12} />
                {new Date(batch.uploadDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: Data Viewer */}
      <div className="w-2/3 bg-white rounded-xl shadow-lg flex flex-col border-t-4 border-brand-medium">
        {selectedBatch ? (
          <>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-700">File Contents</h3>
              <button onClick={() => setSelectedBatch(null)} className="text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <p className="text-center text-gray-400 mt-10">Loading numbers...</p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batchLeads.map((lead) => (
                      <tr key={lead._id}>
                        <td className="px-4 py-3 font-mono text-brand-dark">{lead.phoneNumber}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {lead.assignedTo ? "Assigned" : "Unassigned (Admin)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
            <ChevronRight size={48} />
            <p>Select a file to view data</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default UploadHistory;