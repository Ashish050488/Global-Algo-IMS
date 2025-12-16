import React, { useState, useMemo } from 'react';
import { Trophy, ArrowDown, ArrowUp, StarFill, People } from 'react-bootstrap-icons';

// Define the shape of the performance data
interface TeamMetric {
  id: string;
  rank: number;
  teamLeadName: string;
  weeklyKYCs: number;
  collectionINR: number;
  volume: number;
}

// Mock data (we will sort this dynamically)
const MOCK_DATA: TeamMetric[] = [
  { id: 't001', rank: 0, teamLeadName: 'Rahul Sharma', weeklyKYCs: 150, collectionINR: 1200000, volume: 550 },
  { id: 't002', rank: 0, teamLeadName: 'Priya Verma', weeklyKYCs: 180, collectionINR: 1500000, volume: 700 },
  { id: 't003', rank: 0, teamLeadName: 'Amit Singh', weeklyKYCs: 100, collectionINR: 950000, volume: 400 },
  { id: 't004', rank: 0, teamLeadName: 'Kavita Menon', weeklyKYCs: 165, collectionINR: 1350000, volume: 620 },
  { id: 't005', rank: 0, teamLeadName: 'Zahir Khan', weeklyKYCs: 90, collectionINR: 800000, volume: 350 },
];

// Helper function to format INR currency
const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Define types for sorting
type SortKey = keyof Omit<TeamMetric, 'id' | 'rank'>;
type SortOrder = 'asc' | 'desc';

const TeamPerformancePage: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortOrder }>({
    key: 'weeklyKYCs', // Default sort key
    direction: 'desc', // Default sort direction
  });

  const sortTable = (key: SortKey) => {
    let direction: SortOrder = 'desc';
    // If the same key is clicked, reverse the direction
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    // Create a mutable copy and sort it
    let sortableItems = [...MOCK_DATA];

    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // Assign rank after sorting
    return sortableItems.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [sortConfig]);

  // UI component for the trophy icons
  const TrophyIcon: React.FC<{ rank: number }> = ({ rank }) => {
    const trophyClasses = {
      1: 'text-yellow-500', // Gold
      2: 'text-gray-400',   // Silver
      3: 'text-yellow-700', // Bronze
    };

    if (rank <= 3) {
      return (
        <Trophy className={`inline-block ml-2 ${trophyClasses[rank as 1 | 2 | 3]} w-5 h-5`} />
      );
    }
    return null;
  };

  const SortIndicator: React.FC<{ sortKey: SortKey }> = ({ sortKey }) => {
    if (sortConfig.key !== sortKey) {
      return null;
    }
    return sortConfig.direction === 'desc' ? <ArrowDown className="inline ml-1 w-3 h-3" /> : <ArrowUp className="inline ml-1 w-3 h-3" />;
  };

  const HeaderCell: React.FC<{ label: string; sortKey: SortKey }> = ({ label, sortKey }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-teal-500 transition duration-150"
      onClick={() => sortTable(sortKey)}
    >
      {label}
      <SortIndicator sortKey={sortKey} />
    </th>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        <StarFill className="inline mr-3 text-teal-600" size={30} />
        Team Performance Leaderboard
      </h1>
      
      {/* Total Teams Widget */}
      <div className="mb-8 p-4 bg-teal-600 rounded-lg shadow-lg text-white max-w-sm">
        <p className="text-sm opacity-80">Total Teams Tracked</p>
        <p className="text-4xl font-extrabold">{MOCK_DATA.length}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <People className="mr-2 text-teal-600" size={20} /> Current Rankings (Weekly)
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Team Lead Name</th>
                <HeaderCell label="Weekly KYCs" sortKey="weeklyKYCs" />
                <HeaderCell label="Collection (INR)" sortKey="collectionINR" />
                <HeaderCell label="Volume" sortKey="volume" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedData.map((item) => (
                <tr key={item.id} className={item.rank <= 3 ? 'bg-yellow-50 dark:bg-gray-700/50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                    {item.rank}
                    <TrophyIcon rank={item.rank} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-600 dark:text-teal-400">{item.teamLeadName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.weeklyKYCs.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatINR(item.collectionINR)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.volume.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamPerformancePage;