import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { Network, ChevronDown, ChevronRight, RefreshCw, Building2, UserCircle2 } from 'lucide-react';

const RolePill = ({ role }) => {
  const style = {
    BranchManager: 'bg-blue-50 text-blue-700 border-blue-200',
    TeamLead: 'bg-purple-50 text-purple-700 border-purple-200',
    Employee: 'bg-green-50 text-green-700 border-green-200',
    HR: 'bg-amber-50 text-amber-700 border-amber-200'
  }[role] || 'bg-gray-50 text-gray-700 border-gray-200';

  return <span className={`text-xs px-2 py-0.5 rounded-full border ${style}`}>{role}</span>;
};

const NodeRow = ({ node, depth = 0 }) => {
  const [open, setOpen] = useState(true);
  const hasChildren = (node.children || []).length > 0;

  const Icon = node.role === 'BranchManager' ? Building2 : UserCircle2;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition"
        style={{ marginLeft: depth * 18 }}
      >
        {hasChildren ? (
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-1 rounded hover:bg-gray-100"
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="w-7" />
        )}

        <Icon size={18} className="text-gray-500" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 truncate">{node.name}</span>
            <RolePill role={node.role} />
            {node.branch ? <span className="text-xs text-gray-400 truncate">• {node.branch}</span> : null}
          </div>
        </div>
      </div>

      {hasChildren && open && (
        <div>
          {node.children.map((c) => (
            <NodeRow key={c._id} node={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const HrOrgChart = () => {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchChart = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await api.get('/hr/org-chart');
      setTree(res.data);
    } catch (e) {
      console.error(e);
      setError('Failed to load org chart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChart();
  }, []);

  const stats = useMemo(() => {
    const counts = { BranchManager: 0, TeamLead: 0, Employee: 0 };
    const walk = (n) => {
      if (!n) return;
      if (counts[n.role] !== undefined) counts[n.role] += 1;
      (n.children || []).forEach(walk);
    };
    (tree?.children || []).forEach(walk);
    return counts;
  }, [tree]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-2">
          <Network size={32} /> Org Chart
        </h1>
        <button
          onClick={fetchChart}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5 border-t-4 border-blue-300">
          <p className="text-xs text-gray-500">Branch Managers</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{loading ? '…' : stats.BranchManager}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border-t-4 border-purple-300">
          <p className="text-xs text-gray-500">Team Leads</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{loading ? '…' : stats.TeamLead}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border-t-4 border-green-300">
          <p className="text-xs text-gray-500">Agents</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{loading ? '…' : stats.Employee}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-t-4 border-brand-medium p-4">
        {loading ? (
          <div className="text-gray-400 p-6">Loading…</div>
        ) : (
          <div>
            {(tree?.children || []).length === 0 ? (
              <div className="text-gray-400 p-6">No users found.</div>
            ) : (
              tree.children.map((bm) => <NodeRow key={bm._id} node={bm} depth={0} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HrOrgChart;
