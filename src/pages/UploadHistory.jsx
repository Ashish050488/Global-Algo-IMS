import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { FileSpreadsheet, Calendar, ChevronRight, X, User, Trash2 } from 'lucide-react';

const UploadHistory = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchLeads, setBatchLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // GET CURRENT USER ID & ROLE
  const myId = localStorage.getItem('userId');
  const myRole = localStorage.getItem('role');

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

  // --- DELETE HANDLER ---
  const handleDelete = async (e, batchId, fileName) => {
    e.stopPropagation(); // Stop click from opening the details panel
    
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?\n\nNOTE: Leads that have already been worked on/called will NOT be deleted to preserve employee stats. Unused leads will be permanently removed.`)) {
        return;
    }

    try {
      const res = await api.delete(`/leads/batch/${batchId}`);
      alert(`Success: ${res.data.deletedCount} unused leads deleted.\n(${res.data.retainedCount} active leads were kept safe).`);
      
      // Refresh List & Close Panel
      loadBatches();
      if (selectedBatch === batchId) setSelectedBatch(null);
      
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to delete batch");
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
          {batches.map((batch) => {
            
            const uploaderId = batch.uploadedBy?._id?.toString();
            const isMe = myId && uploaderId === myId;
            const displayName = isMe ? "Me" : (batch.uploadedBy?.name || "Unknown");

            // --- PERMISSION TO DELETE? ---
            // 1. Admin can delete EVERYTHING.
            // 2. LeadManager can ONLY delete 'isMe'.
            const canDelete = myRole === 'Admin' || (myRole === 'LeadManager' && isMe);

            return (
              <div 
                key={batch._id}
                onClick={() => handleBatchClick(batch._id)}
                className={`group relative p-4 rounded-lg cursor-pointer transition border border-gray-100 hover:shadow-md ${
                  selectedBatch === batch._id ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'
                }`}
              >
                {/* File Name & Count */}
                <div className="flex justify-between items-start mb-2 pr-6">
                  <h3 className="font-bold text-gray-800 text-sm truncate w-40" title={batch.fileName}>
                    {batch.fileName}
                  </h3>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {batch.totalCount}
                  </span>
                </div>

                {/* Uploader Name */}
                <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-gray-100">
                  <div className={`flex items-center gap-1.5 font-bold ${isMe ? 'text-blue-600' : 'text-gray-600'}`}>
                    <User size={12} />
                    <span>{displayName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Calendar size={10} />
                    {new Date(batch.uploadDate).toLocaleDateString()}
                  </div>
                </div>

                {/* DELETE BUTTON (Floating) */}
                {canDelete && (
                  <button 
                    onClick={(e) => handleDelete(e, batch._id, batch.fileName)}
                    className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1"
                    title="Delete File"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: Data Viewer (Unchanged) */}
      <div className="w-2/3 bg-white rounded-xl shadow-lg flex flex-col border-t-4 border-brand-medium">
        {selectedBatch ? (
          <>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-700">File Preview</h3>
              <button onClick={() => setSelectedBatch(null)} className="text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <p className="text-center text-gray-400 mt-10">Loading leads...</p>
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
                          <span className={`px-2 py-1 rounded-full text-xs ${
                             lead.status === 'New' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700 font-bold'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {lead.assignedTo ? "Assigned" : "Unassigned (Pool)"}
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
            <p>Select a file to view content</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default UploadHistory;