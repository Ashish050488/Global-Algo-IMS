import React, { useState, useMemo } from 'react';
import { ClipboardCheck, CheckCircleFill, XCircleFill, HourglassSplit, FunnelFill } from 'react-bootstrap-icons';

// Reuse the Ticket Data interface and mock data from Exports (with a few tickets kept Pending)
interface TicketData {
  id: string;
  raisedBy: string;
  raisedDate: string;
  dealtWithBy: string;
  resolution: string;
  status: 'Resolved' | 'Pending' | 'Closed';
}

const INITIAL_TICKETS: TicketData[] = [
  { id: 'T-1007', raisedBy: 'Agent 110', raisedDate: '2025-12-01', dealtWithBy: 'N/A', resolution: 'Lead data missing KYC field.', status: 'Pending' },
  { id: 'T-1006', raisedBy: 'TL Priya', raisedDate: '2025-12-01', dealtWithBy: 'N/A', resolution: 'Assignment batch size exceeded 50.', status: 'Pending' },
  { id: 'T-1005', raisedBy: 'Agent 101', raisedDate: '2025-11-29', dealtWithBy: 'TL Priya', resolution: 'Fixed phone number format.', status: 'Resolved' },
  { id: 'T-1004', raisedBy: 'BM Vikram', raisedDate: '2025-11-28', dealtWithBy: 'Admin Rahul', resolution: 'Batch reassigned to TL Amit.', status: 'Closed' },
  { id: 'T-1003', raisedBy: 'Agent 105', raisedDate: '2025-11-27', dealtWithBy: 'IT Support', resolution: 'Waiting for Admin approval.', status: 'Pending' },
  { id: 'T-1002', raisedBy: 'Admin Sara', raisedDate: '2025-11-26', dealtWithBy: 'IT Support', resolution: 'DB connection reset.', status: 'Resolved' },
];

const AuditPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketData[]>(INITIAL_TICKETS);
  const [filterStatus, setFilterStatus] = useState<'All' | TicketData['status']>('Pending'); // Default view is Pending
  const [resolutionNote, setResolutionNote] = useState<{ [key: string]: string }>({}); // State to hold temporary resolution notes

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (filterStatus !== 'All' && ticket.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [tickets, filterStatus]);

  const handleResolve = (id: string) => {
    const note = resolutionNote[id] || `Ticket manually closed by Admin on ${new Date().toLocaleDateString()}`;
    
    // Simulate updating the ticket status and resolution details
    setTickets(prev => 
      prev.map(t => 
        t.id === id 
          ? { ...t, status: 'Resolved', dealtWithBy: 'Admin', resolution: note }
          : t
      )
    );
    alert(`Ticket ${id} marked as Resolved!`);
    
    // Clear the resolution note state for this ticket
    setResolutionNote(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const StatusBadge: React.FC<{ status: TicketData['status'] }> = ({ status }) => {
    const statusClasses = {
      'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Closed': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    };
    const StatusIcon = {
        'Resolved': CheckCircleFill,
        'Pending': HourglassSplit,
        'Closed': XCircleFill,
    };
    const Icon = StatusIcon[status];
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]} flex items-center`}>
        <Icon className="mr-1" /> {status}
      </span>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        <ClipboardCheck className="inline mr-3 text-teal-600" size={30} />
        Audit & Active Ticket Queue
      </h1>

      {/* Filter Control */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8 max-w-sm">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <FunnelFill className="mr-2 text-teal-600" size={16} /> Filter Status
        </h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'All' | TicketData['status'])}
          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="Pending">Pending Tickets</option>
          <option value="Resolved">Resolved Tickets</option>
          <option value="Closed">Closed Tickets</option>
          <option value="All">All Tickets</option>
        </select>
      </div>

      {/* Ticket Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Raised By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Raised Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Resolution / Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-teal-600 dark:text-teal-400">{ticket.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{ticket.raisedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{ticket.raisedDate}</td>
                  <td className="px-6 py-4 max-w-xs text-sm text-gray-700 dark:text-gray-300">
                    {ticket.status === 'Pending' ? (
                        <textarea
                            value={resolutionNote[ticket.id] || ''}
                            onChange={(e) => setResolutionNote({...resolutionNote, [ticket.id]: e.target.value})}
                            placeholder="Add resolution details..."
                            className="w-full px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs"
                            rows={2}
                        />
                    ) : (
                        <p className="overflow-hidden text-ellipsis">{ticket.resolution}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={ticket.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {ticket.status === 'Pending' ? (
                      <button
                        onClick={() => handleResolve(ticket.id)}
                        className="text-white bg-green-600 hover:bg-green-700 py-1 px-3 rounded-md text-xs font-medium flex items-center transition"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600 text-xs">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <p>No tickets match the current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditPage;