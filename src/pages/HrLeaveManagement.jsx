import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { Check, X, Users, RefreshCw, Calendar } from 'lucide-react';

const statusPill = (status) => {
  const base = 'px-2 py-1 rounded text-xs font-semibold';
  if (status === 'Approved') return `${base} bg-green-100 text-green-800`;
  if (status === 'Rejected') return `${base} bg-red-100 text-red-800`;
  if (status === 'Cancelled') return `${base} bg-gray-100 text-gray-700`;
  return `${base} bg-yellow-100 text-yellow-800`;
};

const HrLeaveManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [loadingEmp, setLoadingEmp] = useState(true);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [error, setError] = useState('');
  const [remarks, setRemarks] = useState({});

  const fetchEmployees = async () => {
    try {
      setError('');
      setLoadingEmp(true);
      const res = await api.get('/leaves/hr/employees');
      const list = Array.isArray(res.data) ? res.data : [];
      setEmployees(list);
      if (!selectedUserId && list.length) setSelectedUserId(list[0]._id);
    } catch (e) {
      console.error(e);
      setError('Failed to load employees');
    } finally {
      setLoadingEmp(false);
    }
  };

  const fetchLeaves = async (uid) => {
    if (!uid) return;
    try {
      setError('');
      setLoadingLeaves(true);
      const res = await api.get(`/leaves/hr?userId=${uid}`);
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setError('Failed to load leave requests');
    } finally {
      setLoadingLeaves(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedUserId) fetchLeaves(selectedUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e._id === selectedUserId),
    [employees, selectedUserId]
  );

  const decide = async (leaveId, decision) => {
    try {
      setError('');
      await api.post(`/leaves/hr/${leaveId}/decide`, {
        decision,
        remarks: remarks[leaveId] || ''
      });
      await fetchLeaves(selectedUserId);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.msg || 'Failed to update leave request');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-2">
          <Calendar size={32} /> Leave Management
        </h1>
        <button
          onClick={() => {
            fetchEmployees();
            if (selectedUserId) fetchLeaves(selectedUserId);
          }}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Employee List */}
        <div className="bg-white rounded-xl shadow-lg p-4 border-t-4 border-brand-medium">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Users size={18} /> Employees
            </p>
            <span className="text-xs text-gray-500">{employees.length}</span>
          </div>

          {loadingEmp ? (
            <div className="text-gray-400">Loading…</div>
          ) : employees.length === 0 ? (
            <div className="text-gray-400">No employees</div>
          ) : (
            <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
              {employees.map((u) => (
                <button
                  key={u._id}
                  onClick={() => setSelectedUserId(u._id)}
                  className={
                    u._id === selectedUserId
                      ? 'w-full text-left p-3 rounded-lg bg-brand-medium text-white'
                      : 'w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100'
                  }
                >
                  <div className="font-semibold">{u.name}</div>
                  <div className={u._id === selectedUserId ? 'text-xs text-white/80' : 'text-xs text-gray-500'}>
                    {u.role} • {u.email}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Leave List */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-3 border-t-4 border-gray-300">
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-700">Requests</p>
            <p className="text-xs text-gray-500">
              {selectedEmployee ? (
                <>
                  Showing leave requests for <span className="font-semibold">{selectedEmployee.name}</span>
                </>
              ) : (
                'Select an employee'
              )}
            </p>
          </div>

          {loadingLeaves ? (
            <div className="text-gray-400">Loading…</div>
          ) : leaves.length === 0 ? (
            <div className="text-gray-400">No leave requests</div>
          ) : (
            <div className="space-y-3">
              {leaves.map((lr) => (
                <div key={lr._id} className="border rounded-xl p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{lr.type}</span>
                        <span className={statusPill(lr.status)}>{lr.status}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1 font-mono">
                        {lr.startDate} → {lr.endDate}
                      </div>
                      {lr.reason ? <div className="text-xs text-gray-500 mt-1">Reason: {lr.reason}</div> : null}
                      {lr.decisionRemarks ? (
                        <div className="text-xs text-gray-500 mt-1">HR: {lr.decisionRemarks}</div>
                      ) : null}
                    </div>

                    {lr.status === 'Pending' ? (
                      <div className="flex flex-col gap-2 w-full md:w-[380px]">
                        <input
                          className="w-full p-2 border rounded-lg"
                          placeholder="Remarks (optional)"
                          value={remarks[lr._id] || ''}
                          onChange={(e) => setRemarks((p) => ({ ...p, [lr._id]: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => decide(lr._id, 'Approved')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                          >
                            <Check size={18} /> Approve
                          </button>
                          <button
                            onClick={() => decide(lr._id, 'Rejected')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                          >
                            <X size={18} /> Reject
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Approving will automatically mark Attendance as <b>Paid Leave/Half Day</b> for those dates.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HrLeaveManagement;
