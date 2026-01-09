import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { UsersRound, RefreshCw } from 'lucide-react';

const HrHeadcount = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHeadcount = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await api.get('/hr/headcount');
      setData(res.data);
    } catch (e) {
      console.error(e);
      setError('Failed to load headcount');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeadcount();
  }, []);

  const roleRows = useMemo(() => {
    if (!data?.byRole) return [];
    return Object.entries(data.byRole)
      .sort((a, b) => b[1] - a[1])
      .map(([role, count]) => ({ role, count }));
  }, [data]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-2">
          <UsersRound size={32} /> Headcount
        </h1>
        <button
          onClick={fetchHeadcount}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-medium text-white hover:bg-brand-dark transition"
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-brand-medium">
          <p className="text-sm text-gray-500">Total Staff</p>
          <p className="text-4xl font-extrabold text-brand-dark mt-2">
            {loading ? '…' : (data?.total ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-2">(Excludes Admin)</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 border-t-4 border-gray-300">
          <p className="text-sm font-bold text-gray-700 mb-4">Breakdown by Role</p>
          {loading ? (
            <div className="text-gray-400">Loading…</div>
          ) : (
            <div className="divide-y">
              {roleRows.length === 0 ? (
                <div className="text-gray-400">No data</div>
              ) : (
                roleRows.map((r) => (
                  <div key={r.role} className="flex items-center justify-between py-3">
                    <span className="font-semibold text-gray-700">{r.role}</span>
                    <span className="font-mono text-gray-900">{r.count}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HrHeadcount;
