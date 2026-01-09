

import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { Users, ChevronRight, AlertCircle, CheckCircle, Search } from 'lucide-react';

// --- helper: decode JWT to get current user id + role ---
const getAuthFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { id: null, role: null };
    const payload = token.split('.')[1];
    if (!payload) return { id: null, role: null };
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return {
      id: json?.id || json?._id || json?.userId || json?.sub || null,
      role: json?.role || null
    };
  } catch {
    return { id: null, role: null };
  }
};

const ALL_ROLES = [
  { key: 'BranchManager', label: 'Branch Managers' },
  { key: 'TeamLead', label: 'Team Leads' },
  { key: 'Employee', label: 'Employees' }
];

const ROLE_VISIBLE_TABS = {
  Admin: ['BranchManager', 'TeamLead', 'Employee'],
  BranchManager: ['TeamLead', 'Employee'],
  TeamLead: ['Employee']
};

const LeadDistribution = () => {
  const auth = useMemo(() => getAuthFromToken(), []);
  const myUserId = auth.id;
  const myRole = auth.role;

  const [myLeadCount, setMyLeadCount] = useState(0);

  // users from /auth/downline
  const [users, setUsers] = useState([]);

  // per-user split values
  const [distributions, setDistributions] = useState({});

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // batches (all) + eligible batches (unassigned for me)
  const [allBatches, setAllBatches] = useState([]);
  const [eligibleBatches, setEligibleBatches] = useState([]);

  // selected batch: '', 'ALL', or batchId
  const [selectedBatchId, setSelectedBatchId] = useState('');

  // tabs + per-tab search
  const visibleTabKeys = useMemo(() => ROLE_VISIBLE_TABS[myRole] || [], [myRole]);

  const [activeTab, setActiveTab] = useState(() => {
    const first = ROLE_VISIBLE_TABS[getAuthFromToken().role]?.[0];
    return first || 'Employee';
  });

  const [searchByRole, setSearchByRole] = useState({
    BranchManager: '',
    TeamLead: '',
    Employee: ''
  });

  // keep active tab valid when role changes / computed
  useEffect(() => {
    if (!visibleTabKeys.includes(activeTab)) {
      setActiveTab(visibleTabKeys[0] || 'Employee');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myRole]);

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async () => {
    try {
      setMsg({ text: '', type: '' });

      // ✅ get everyone under me (multi-level)
      const usersRes = await api.get('/auth/downline');
      const downline = usersRes.data || [];
      setUsers(downline);

      // init distributions for all users
      const initialDist = {};
      downline.forEach(u => (initialDist[u._id] = 0));
      setDistributions(initialDist);

      // ✅ get all batches
      const batchRes = await api.get('/leads/batches');
      const batchList = batchRes.data || [];
      setAllBatches(batchList);

      // ✅ compute eligible batches (only those where I still have NEW leads)
      await computeEligibleBatches(batchList);

    } catch (err) {
      console.error(err);
      setMsg({ text: 'Error loading distribution data.', type: 'error' });
    }
  };

  // ✅ compute eligible batches by checking each batch for "New + assignedTo = me"
  const computeEligibleBatches = async (batchList) => {
    try {
      if (!myUserId) {
        setEligibleBatches([]);
        setSelectedBatchId('ALL');
        return;
      }

      // if no batches, default ALL
      if (!batchList || batchList.length === 0) {
        setEligibleBatches([]);
        setSelectedBatchId('ALL');
        await fetchPoolCount('ALL');
        return;
      }

      // fetch each batch details and check if there are any New leads for me
      const checks = await Promise.all(
        batchList.map(async (b) => {
          try {
            const leadsRes = await api.get(`/leads/batch/${b._id}`);
            const leads = leadsRes.data || [];
            const mineNewCount = leads.filter(
              (l) =>
                l.status === 'New' &&
                String(l.assignedTo?._id || l.assignedTo || '') === String(myUserId)
            ).length;

            return { batch: b, mineNewCount };
          } catch {
            return { batch: b, mineNewCount: 0 };
          }
        })
      );

      const eligible = checks
        .filter(x => x.mineNewCount > 0)
        .map(x => ({ ...x.batch, mineNewCount: x.mineNewCount }));

      // sort newest first (same as your backend)
      eligible.sort((a, b) => new Date(b.uploadDate || b.createdAt || 0) - new Date(a.uploadDate || a.createdAt || 0));

      setEligibleBatches(eligible);

      // Choose default selection:
      // - If eligible batches exist => first eligible batch
      // - else => ALL
      if (eligible.length > 0) {
        setSelectedBatchId(eligible[0]._id);
        await fetchPoolCount(eligible[0]._id);
      } else {
        setSelectedBatchId('ALL');
        await fetchPoolCount('ALL');
      }
    } catch (err) {
      console.error(err);
      setEligibleBatches([]);
      setSelectedBatchId('ALL');
      await fetchPoolCount('ALL');
    }
  };

  // refresh pool when selectedBatchId changes
  useEffect(() => {
    if (!selectedBatchId) {
      setMyLeadCount(0);
      return;
    }
    fetchPoolCount(selectedBatchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId]);

  // ✅ pool count:
  // - ALL => /leads/stats (New leads assigned to me across all batches)
  // - batch => count New leads assigned to me in that batch
  const fetchPoolCount = async (batchId) => {
    try {
      setMsg({ text: '', type: '' });

      if (batchId === 'ALL') {
        const statsRes = await api.get('/leads/stats');
        setMyLeadCount(statsRes.data?.availableLeads ?? 0);
        return;
      }

      const leadsRes = await api.get(`/leads/batch/${batchId}`);
      const leads = leadsRes.data || [];

      const availableForMe = leads.filter(
        (l) =>
          l.status === 'New' &&
          String(l.assignedTo?._id || l.assignedTo || '') === String(myUserId)
      );

      setMyLeadCount(availableForMe.length);
    } catch (err) {
      console.error(err);
      setMyLeadCount(0);
    }
  };

  const handleInputChange = (userId, value) => {
    setDistributions(prev => ({ ...prev, [userId]: parseInt(value) || 0 }));
  };

  const resetSplitInputs = () => {
    const reset = {};
    users.forEach(u => (reset[u._id] = 0));
    setDistributions(reset);
  };

  // group users by role (all downline), but we will display tabs based on login role
  const groupedUsers = useMemo(() => {
    const groups = { BranchManager: [], TeamLead: [], Employee: [] };

    users.forEach(u => {
      if (groups[u.role]) groups[u.role].push(u);
    });

    Object.keys(groups).forEach(k => {
      groups[k].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    });

    return groups;
  }, [users]);

  const tabCounts = useMemo(() => ({
    BranchManager: groupedUsers.BranchManager.length,
    TeamLead: groupedUsers.TeamLead.length,
    Employee: groupedUsers.Employee.length
  }), [groupedUsers]);

  const filteredUsersByActiveTab = useMemo(() => {
    const list = groupedUsers[activeTab] || [];
    const q = (searchByRole[activeTab] || '').trim().toLowerCase();
    if (!q) return list;

    return list.filter(u => {
      const name = String(u.name || '').toLowerCase();
      const email = String(u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [groupedUsers, activeTab, searchByRole]);

  const handleEqualSplit = () => {
    const visible = filteredUsersByActiveTab;
    if (visible.length === 0 || myLeadCount === 0) return;

    const perPerson = Math.floor(myLeadCount / visible.length);

    setDistributions(prev => {
      const copy = { ...prev };
      visible.forEach(u => (copy[u._id] = perPerson));
      return copy;
    });
  };

  const afterSuccessfulDistribution = async () => {
    // refresh pool
    await fetchPoolCount(selectedBatchId);

    // refresh eligible batches (so assigned batches disappear)
    // use latest allBatches list from state
    await computeEligibleBatches(allBatches);

    resetSplitInputs();
  };

  const handleDistributeSplit = async () => {
    setMsg({ text: '', type: '' });

    if (!selectedBatchId) {
      setMsg({ text: 'Please select a batch (or ALL) first.', type: 'error' });
      return;
    }

    const assignments = Object.entries(distributions).map(([userId, count]) => ({
      userId,
      count: Number(count) || 0
    }));

    const totalRequested = assignments.reduce((acc, curr) => acc + curr.count, 0);

    if (totalRequested === 0) {
      setMsg({ text: 'Please enter some lead counts (or use Auto-Split).', type: 'error' });
      return;
    }

    if (totalRequested > myLeadCount) {
      setMsg({ text: `Error: You only have ${myLeadCount} leads in this pool.`, type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const payload = { assignments };
      if (selectedBatchId !== 'ALL') payload.batchId = selectedBatchId;

      const res = await api.post('/leads/distribute', payload);

      setMsg({
        text: res.data?.details || res.data?.msg || 'Distribution completed.',
        type: 'success'
      });

      await afterSuccessfulDistribution();
    } catch (err) {
      console.error(err);
      setMsg({ text: err?.response?.data?.msg || 'Distribution Failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAllToPerson = async (userId) => {
    setMsg({ text: '', type: '' });

    if (!selectedBatchId) {
      setMsg({ text: 'Please select a batch (or ALL) first.', type: 'error' });
      return;
    }

    if (myLeadCount === 0) {
      setMsg({ text: 'No leads available to assign in this pool.', type: 'error' });
      return;
    }

    const confirmText =
      selectedBatchId === 'ALL'
        ? `Assign ALL ${myLeadCount} leads across ALL batches to this person?`
        : `Assign ALL ${myLeadCount} leads from this batch to this person?`;

    if (!window.confirm(confirmText)) return;

    try {
      setLoading(true);

      const payload = { assignments: [{ userId, count: myLeadCount }] };
      if (selectedBatchId !== 'ALL') payload.batchId = selectedBatchId;

      const res = await api.post('/leads/distribute', payload);

      setMsg({
        text: res.data?.details || res.data?.msg || 'Assigned all leads successfully.',
        type: 'success'
      });

      await afterSuccessfulDistribution();
    } catch (err) {
      console.error(err);
      setMsg({ text: err?.response?.data?.msg || 'Assign All Failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const visibleTabs = useMemo(() => {
    return ALL_ROLES.filter(t => visibleTabKeys.includes(t.key));
  }, [visibleTabKeys]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-dark mb-6 flex items-center gap-2">
        <Users /> Lead Distribution Center
      </h1>

      {msg.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {msg.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border-t-4 border-brand-light p-8">
        {/* ✅ Batch Selector (ONLY eligible batches + ALL option) */}
        <div className="mb-6">
          <p className="text-gray-700 font-bold mb-2">Select Upload Batch</p>
          <select
            className="w-full p-3 border rounded-lg font-bold text-brand-dark focus:ring-2 focus:ring-brand-medium outline-none"
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
          >
            <option value="">-- Select a Batch --</option>
            <option value="ALL">All Batches (Your Total New Pool)</option>

            {eligibleBatches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.fileName} — You have {b.mineNewCount} leads
              </option>
            ))}
          </select>

          <p className="text-xs text-gray-500 mt-2">
            Only batches where you still have <b>New</b> leads are shown. Once you distribute them, the batch disappears.
          </p>
        </div>

        {/* Pool */}
        <div className="bg-brand-bg p-6 rounded-xl mb-6 flex justify-between items-center border border-brand-light">
          <div>
            <p className="text-gray-600 font-bold mb-1">Your Available Pool</p>
            <p className="text-sm text-gray-500">
              {selectedBatchId === 'ALL' ? 'All batches combined' : 'Selected batch only'}
            </p>
          </div>
          <span className="text-4xl font-black text-brand-dark">{myLeadCount}</span>
        </div>

        {/* ✅ Role Tabs (role-based visibility) */}
        <div className="mb-6">
          <div className="flex gap-3 flex-wrap">
            {visibleTabs.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-lg font-bold border-2 transition ${
                  activeTab === t.key
                    ? 'bg-brand-bg border-brand-medium text-brand-dark'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.label} <span className="ml-1 text-xs opacity-70">({tabCounts[t.key]})</span>
              </button>
            ))}
          </div>

          {/* Search per tab */}
          <div className="mt-4 flex items-center gap-2 border rounded-lg p-3">
            <Search size={18} className="text-gray-400" />
            <input
              className="w-full outline-none font-semibold text-gray-700"
              placeholder={`Search ${activeTab} by name or email...`}
              value={searchByRole[activeTab] || ''}
              onChange={(e) =>
                setSearchByRole(prev => ({ ...prev, [activeTab]: e.target.value }))
              }
            />
          </div>
        </div>

        {/* List */}
        <div className="mb-6">
          {filteredUsersByActiveTab.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No users found in this tab.</p>
          ) : (
            <div className="space-y-4">
              {filteredUsersByActiveTab.map((u) => (
                <div
                  key={u._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100"
                >
                  <div>
                    <p className="font-bold text-gray-800">{u.name}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase">{u.role}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <span className="text-sm text-gray-500 font-bold">Leads:</span>

                    <input
                      type="number"
                      min="0"
                      className="w-24 p-2 border rounded text-center font-bold text-lg text-brand-dark focus:ring-2 focus:ring-brand-medium outline-none"
                      value={distributions[u._id] || 0}
                      onChange={(e) => handleInputChange(u._id, e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={() => handleAssignAllToPerson(u._id)}
                      disabled={loading || myLeadCount === 0 || !selectedBatchId}
                      className="py-2 px-4 rounded-lg font-bold border-2 border-brand-dark text-brand-dark hover:bg-white transition disabled:opacity-50"
                      title="Assign the entire available pool to this person"
                    >
                      Assign All
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleEqualSplit}
            disabled={!selectedBatchId || myLeadCount === 0 || filteredUsersByActiveTab.length === 0 || loading}
            className="flex-1 py-3 text-brand-medium font-bold border-2 border-brand-medium rounded-lg hover:bg-brand-bg transition disabled:opacity-50"
          >
            Auto-Split Equally (This Tab)
          </button>

          <button
            onClick={handleDistributeSplit}
            disabled={loading || !selectedBatchId || myLeadCount === 0}
            className="flex-1 bg-brand-dark hover:bg-black text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? 'Processing...' : 'Confirm Distribution'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDistribution;
