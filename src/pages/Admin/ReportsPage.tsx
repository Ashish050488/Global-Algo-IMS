import React, { useState, useMemo } from 'react';
import { BarChartFill, People, Person, CalendarDate, FunnelFill } from 'react-bootstrap-icons';

// --- MOCK DATA STRUCTURES ---

interface AgentReport {
  agentName: string;
  leadsProcessed: number;
  kycConversion: number; // Percentage 0-100
  collectionValue: number; // INR
  reportDate: string;
  reportedByTL: string;
}

interface TeamLeadReport {
  teamLeadName: string;
  teamSize: number;
  totalTeamLeads: number;
  averageKYCConversion: number; // Percentage 0-100
  totalCollection: number; // INR
  reportDate: string;
  reportedByBM: string;
}

// Mock Data
const AGENT_REPORTS: AgentReport[] = [
  { agentName: 'Ravi Kumar', leadsProcessed: 120, kycConversion: 85, collectionValue: 500000, reportDate: '2025-11-30', reportedByTL: 'Priya Verma' },
  { agentName: 'Sara John', leadsProcessed: 150, kycConversion: 78, collectionValue: 420000, reportDate: '2025-11-30', reportedByTL: 'Priya Verma' },
  { agentName: 'Benny Das', leadsProcessed: 90, kycConversion: 92, collectionValue: 610000, reportDate: '2025-11-30', reportedByTL: 'Rahul Sharma' },
  { agentName: 'Akash Patel', leadsProcessed: 110, kycConversion: 88, collectionValue: 550000, reportDate: '2025-11-23', reportedByTL: 'Rahul Sharma' },
];

const TEAM_LEAD_REPORTS: TeamLeadReport[] = [
  { teamLeadName: 'Priya Verma', teamSize: 5, totalTeamLeads: 450, averageKYCConversion: 81, totalCollection: 2800000, reportDate: '2025-12-01', reportedByBM: 'Alia Khan' },
  { teamLeadName: 'Rahul Sharma', teamSize: 4, totalTeamLeads: 390, averageKYCConversion: 89, totalCollection: 2300000, reportDate: '2025-12-01', reportedByBM: 'Alia Khan' },
  { teamLeadName: 'Kavita Menon', teamSize: 6, totalTeamLeads: 510, averageKYCConversion: 75, totalCollection: 3100000, reportDate: '2025-11-24', reportedByBM: 'Vikram Singh' },
];

// Helper function to format INR currency
const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agent' | 'team_lead'>('agent');
  const [filterManager, setFilterManager] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const activeClass = 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400 font-semibold';
  const inactiveClass = 'border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200';

  // Extract manager options for filtering
  const allTLs = Array.from(new Set(AGENT_REPORTS.map(r => r.reportedByTL)));
  const allBMs = Array.from(new Set(TEAM_LEAD_REPORTS.map(r => r.reportedByBM)));
  const managerOptions = activeTab === 'agent' ? allTLs : allBMs;

  // --- Filtering Logic ---
  const filteredAgentReports = useMemo(() => {
    return AGENT_REPORTS.filter(report => {
      if (filterManager && report.reportedByTL !== filterManager) return false;
      // Date filtering logic would go here in a real app
      return true;
    });
  }, [filterManager]);

  const filteredTeamLeadReports = useMemo(() => {
    return TEAM_LEAD_REPORTS.filter(report => {
      if (filterManager && report.reportedByBM !== filterManager) return false;
      // Date filtering logic would go here in a real app
      return true;
    });
  }, [filterManager]);

  // --- Report Tables ---

  const AgentReportTable: React.FC<{ reports: AgentReport[] }> = ({ reports }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Agent Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Leads Processed</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">KYC Conversion</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Collection Value</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Report Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reported By (TL)</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {reports.map((report, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-teal-600 dark:text-teal-400">{report.agentName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{report.leadsProcessed.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{report.kycConversion}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatINR(report.collectionValue)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{report.reportDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{report.reportedByTL}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const TeamLeadReportTable: React.FC<{ reports: TeamLeadReport[] }> = ({ reports }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Team Lead Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Team Size</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg KYC Conversion</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Team Collection</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Report Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reported By (BM)</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {reports.map((report, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-teal-600 dark:text-teal-400">{report.teamLeadName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{report.teamSize}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{report.averageKYCConversion}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatINR(report.totalCollection)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{report.reportDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{report.reportedByBM}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        <BarChartFill className="inline mr-3 text-teal-600" size={30} />
        Operational Reports
      </h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => { setActiveTab('agent'); setFilterManager(''); }}
          className={`py-2 px-4 transition duration-150 flex items-center ${activeTab === 'agent' ? activeClass : inactiveClass}`}
        >
          <Person className="mr-2" /> Agent Reports
        </button>
        <button
          onClick={() => { setActiveTab('team_lead'); setFilterManager(''); }}
          className={`py-2 px-4 transition duration-150 flex items-center ${activeTab === 'team_lead' ? activeClass : inactiveClass}`}
        >
          <People className="mr-2" /> Team Lead Reports
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FunnelFill className="mr-2 text-teal-600" size={20} /> Report Filters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Manager Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reporting Manager ({activeTab === 'agent' ? 'Team Lead' : 'Branch Manager'})
            </label>
            <select
              value={filterManager}
              onChange={(e) => setFilterManager(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Managers</option>
              {managerOptions.map(manager => <option key={manager} value={manager}>{manager}</option>)}
            </select>
          </div>

          {/* Date Filters (Start/End) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
              <CalendarDate className="mr-1" /> Start Date
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                <CalendarDate className="mr-1" /> End Date
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
                onClick={() => alert('Exporting current filtered report... (Simulated)')}
                className="w-full bg-teal-600 text-white py-2.5 px-4 rounded-md hover:bg-teal-700 transition duration-200 font-semibold flex items-center justify-center"
            >
                Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {activeTab === 'agent' ? 'Individual Agent Reports' : 'Team Lead Summary Reports'}
        </h2>
        
        {activeTab === 'agent' ? (
          <AgentReportTable reports={filteredAgentReports} />
        ) : (
          <TeamLeadReportTable reports={filteredTeamLeadReports} />
        )}

        {(activeTab === 'agent' && filteredAgentReports.length === 0) || (activeTab === 'team_lead' && filteredTeamLeadReports.length === 0) ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <p>No reports match the current filters.</p>
            </div>
        ) : null}
      </div>
    </div>
  );
};

export default ReportsPage;