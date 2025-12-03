import React, { useState } from 'react';
import { FileEarmarkSpreadsheet, PersonFillAdd, CheckCircleFill, HourglassSplit } from 'react-bootstrap-icons';
import Modal from 'react-modal'; 

// Assume a list of Branch Managers
const BRANCH_MANAGERS = [
  { id: 'bm001', name: 'Alia Khan' },
  { id: 'bm002', name: 'Vikram Singh' },
  { id: 'bm003', name: 'Priya Reddy' },
];

// Define the shape of a Lead Batch
interface LeadBatch {
  batchId: string;
  uploadDate: string;
  sourceFile: string;
  acceptedCount: number;
  assignedTo: string | null; // Null if unassigned
}

// Mock data for the lead batches
const MOCK_BATCHES: LeadBatch[] = [
  { batchId: 'B-20251130-1', uploadDate: '2025-11-30', sourceFile: 'Q4_Leads_Europe.xlsx', acceptedCount: 985, assignedTo: null },
  { batchId: 'B-20251128-1', uploadDate: '2025-11-28', sourceFile: 'Q4_Leads_India.xls', acceptedCount: 450, assignedTo: 'Vikram Singh' },
  { batchId: 'B-20251125-1', uploadDate: '2025-11-25', sourceFile: 'Demo_Upload.xlsx', acceptedCount: 100, assignedTo: null },
  { batchId: 'B-20251120-1', uploadDate: '2025-11-20', sourceFile: 'Old_Leads.xls', acceptedCount: 200, assignedTo: 'Alia Khan' },
];

const IntakeExcelPage: React.FC = () => {
  const [batches, setBatches] = useState<LeadBatch[]>(MOCK_BATCHES);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<LeadBatch | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState('');

  // Filtering for the 'unassigned' tab
  const unassignedBatches = batches.filter(b => b.assignedTo === null);
  const assignedBatches = batches.filter(b => b.assignedTo !== null);

  const openAssignModal = (batch: LeadBatch) => {
    setSelectedBatch(batch);
    setSelectedManagerId('');
    setModalIsOpen(true);
  };

  const handleAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch || !selectedManagerId) return;

    const manager = BRANCH_MANAGERS.find(m => m.id === selectedManagerId);
    if (!manager) return;

    // Simulation of assignment logic
    setBatches(prev => 
      prev.map(b => 
        b.batchId === selectedBatch.batchId 
          ? { ...b, assignedTo: manager.name }
          : b
      )
    );
    
    alert(`Batch ${selectedBatch.batchId} assigned to ${manager.name} (simulated)!`);
    setModalIsOpen(false);
  };

  // State to control which list is visible
  const [activeTab, setActiveTab] = useState<'unassigned' | 'assigned'>('unassigned');
  
  const activeClass = 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400 font-semibold';
  const inactiveClass = 'border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200';

  const TableHeader: React.FC = () => (
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Batch ID</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Upload Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source File</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Accepted Leads</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assigned To</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
      </tr>
    </thead>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        <FileEarmarkSpreadsheet className="inline mr-3 text-teal-600" size={30} />
        Lead Batch Intake & Assignment
      </h1>
      
      {/* Tabs for Filtering */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('unassigned')}
          className={`py-2 px-4 transition duration-150 ${activeTab === 'unassigned' ? activeClass : inactiveClass}`}
        >
          Unassigned Batches ({unassignedBatches.length})
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`py-2 px-4 transition duration-150 ${activeTab === 'assigned' ? activeClass : inactiveClass}`}
        >
          Assigned Batches ({assignedBatches.length})
        </button>
      </div>

      {/* Batches Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <TableHeader />
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {(activeTab === 'unassigned' ? unassignedBatches : assignedBatches).map((batch) => (
                <tr key={batch.batchId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-teal-600 dark:text-teal-400">{batch.batchId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{batch.uploadDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{batch.sourceFile}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{batch.acceptedCount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {batch.assignedTo ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircleFill className="mr-1" /> {batch.assignedTo}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        <HourglassSplit className="mr-1" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {batch.assignedTo === null ? (
                      <button
                        onClick={() => openAssignModal(batch)}
                        className="text-white bg-teal-600 hover:bg-teal-700 py-1 px-3 rounded-md text-xs font-medium flex items-center transition"
                      >
                        <PersonFillAdd className="mr-1" /> Assign Manager
                      </button>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600 text-xs">Assigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Empty State */}
          {(activeTab === 'unassigned' && unassignedBatches.length === 0) && (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <CheckCircleFill size={30} className="mb-2 text-green-500" />
              <p>All current lead batches have been assigned to Branch Managers.</p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal Viewer */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Assign Batch"
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Assign Batch: {selectedBatch?.batchId}
            </h3>
            <button onClick={() => setModalIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl">
              &times;
            </button>
          </div>
          <form onSubmit={handleAssignment} className="p-5">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select the Branch Manager responsible for distributing the **{selectedBatch?.acceptedCount.toLocaleString()}** leads in this batch.
            </p>
            
            {/* Branch Manager Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch Manager
              </label>
              <select
                value={selectedManagerId}
                onChange={(e) => setSelectedManagerId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
              >
                <option value="" disabled>Select a Manager</option>
                {BRANCH_MANAGERS.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition duration-200 font-semibold flex items-center justify-center"
            >
              <PersonFillAdd className="mr-2" /> Confirm Assignment
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default IntakeExcelPage;