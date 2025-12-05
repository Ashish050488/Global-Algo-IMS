import React, { useState, useMemo } from 'react';
import { Download, FunnelFill, FileEarmarkPdf } from 'react-bootstrap-icons';

// Define the shape of the Ticket Data
interface TicketData {
  id: string;
  raisedBy: string; // The user who raised the ticket
  raisedDate: string; // Date ticket was raised
  dealtWithBy: string; // The user who resolved the ticket
  resolvedDate: string; // Date ticket was resolved/closed
  resolution: string; // Summary of resolution
  status: 'Resolved' | 'Pending' | 'Closed';
}

// Mock Data for the last 45 days (subset for display)
const MOCK_TICKETS: TicketData[] = [
  { id: 'T-1005', raisedBy: 'Agent 101', raisedDate: '2025-11-29', dealtWithBy: 'TL Priya', resolvedDate: '2025-11-29', resolution: 'Fixed phone number format.', status: 'Resolved' },
  { id: 'T-1004', raisedBy: 'BM Vikram', raisedDate: '2025-11-28', dealtWithBy: 'Admin Rahul', resolvedDate: '2025-11-30', resolution: 'Batch reassigned to TL Amit.', status: 'Closed' },
  { id: 'T-1003', raisedBy: 'Agent 105', raisedDate: '2025-11-27', dealtWithBy: 'TL Rahul', resolvedDate: '', resolution: 'Waiting for Admin approval.', status: 'Pending' },
  { id: 'T-1002', raisedBy: 'Admin Sara', raisedDate: '2025-11-26', dealtWithBy: 'IT Support', resolvedDate: '2025-11-27', resolution: 'DB connection reset.', status: 'Resolved' },
  { id: 'T-1001', raisedBy: 'TL Kavita', raisedDate: '2025-11-25', dealtWithBy: 'BM Alia', resolvedDate: '2025-11-25', resolution: 'Training materials updated.', status: 'Closed' },
];

const ExportsPage: React.FC = () => {
  const [filterRaisedBy, setFilterRaisedBy] = useState('');
  const [filterDealtBy, setFilterDealtBy] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | TicketData['status']>('All');

  // Static options for filters (derived from mock data for simplicity)
  const raisedByOptions = Array.from(new Set(MOCK_TICKETS.map(t => t.raisedBy)));
  const dealtByOptions = Array.from(new Set(MOCK_TICKETS.map(t => t.dealtWithBy)));

  const filteredTickets = useMemo(() => {
    return MOCK_TICKETS.filter(ticket => {
      // Filter by Raised By
      if (filterRaisedBy && ticket.raisedBy !== filterRaisedBy) {
        return false;
      }
      // Filter by Dealt With By
      if (filterDealtBy && ticket.dealtWithBy !== filterDealtBy) {
        return false;
      }
      // Filter by Status
      if (filterStatus !== 'All' && ticket.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [filterRaisedBy, filterDealtBy, filterStatus]);

  const handleExport = () => {
    alert(`Export of ${filteredTickets.length} records initiated! (Simulated PDF/CSV download log)`);
    console.log(`Exported Data:`, filteredTickets);
    // In a real app, this would trigger a download link UI for PDF or CSV.
  };

  const StatusBadge: React.FC<{ status: TicketData['status'] }> = ({ status }) => {
    const statusClasses = {
      'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Closed': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        <FileEarmarkPdf className="inline mr-3 text-red-600" size={30} />
        Ticket Data Exports (Last 45 Days)
      </h1>

      {/* Filter and Export Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FunnelFill className="mr-2 text-teal-600" size={20} /> Filter & Export Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Filter: Raised By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raised By</label>
            <select
              value={filterRaisedBy}
              onChange={(e) => setFilterRaisedBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Users</option>
              {raisedByOptions.map(user => <option key={user} value={user}>{user}</option>)}
            </select>
          </div>

          {/* Filter: Dealt With By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dealt With By</label>
            <select
              value={filterDealtBy}
              onChange={(e) => setFilterDealtBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Handlers</option>
              {dealtByOptions.map(user => <option key={user} value={user}>{user}</option>)}
            </select>
          </div>

          {/* Filter: Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'All' | TicketData['status'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Resolved">Resolved</option>
              <option value="Pending">Pending</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          
          {/* Export Button */}
          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="w-full bg-red-600 text-white py-2.5 px-4 rounded-md hover:bg-red-700 transition duration-200 font-semibold flex items-center justify-center"
            >
              <Download className="mr-2" /> Export ({filteredTickets.length})
            </button>
          </div>

        </div>
      </div>

      {/* Ticket Data Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Filtered Ticket Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Raised By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dealt With By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Raised Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Resolution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-teal-600 dark:text-teal-400">{ticket.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{ticket.raisedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{ticket.dealtWithBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{ticket.raisedDate}</td>
                  <td className="px-6 py-4 max-w-xs overflow-hidden text-ellipsis text-sm text-gray-700 dark:text-gray-300">{ticket.resolution}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={ticket.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <p>No ticket data matches the current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportsPage;