import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, Plus, RefreshCw, X } from 'lucide-react';

const pill = (status) => {
  const base = 'px-2 py-1 rounded text-xs font-semibold';
  if (status === 'Approved') return `${base} bg-green-100 text-green-800`;
  if (status === 'Rejected') return `${base} bg-red-100 text-red-800`;
  if (status === 'Cancelled') return `${base} bg-gray-100 text-gray-700`;
  return `${base} bg-yellow-100 text-yellow-800`;
};

const MyLeave = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ startDate: '', endDate: '', type: 'Paid Leave', reason: '' });

  const fetchMine = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await api.get('/leaves/mine');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setError('Failed to load your leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMine();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      setError('Start and End date are required');
      return;
    }
    try {
      setError('');
      setSaving(true);
      await api.post('/leaves', form);
      setForm({ startDate: '', endDate: '', type: 'Paid Leave', reason: '' });
      await fetchMine();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.msg || 'Failed to submit leave request');
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id) => {
    try {
      setError('');
      setSaving(true);
      await api.post(`/leaves/${id}/cancel`);
      await fetchMine();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.msg || 'Failed to cancel');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-2">
          <Calendar size={32} /> My Leave Requests
        </h1>
        <button
          onClick={fetchMine}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-brand-medium">
          <p className="text-sm font-bold text-gray-700 mb-4">Request Leave</p>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Type</label>
              <select
                className="w-full mt-1 p-3 border rounded-lg"
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              >
                <option value="Paid Leave">Paid Leave</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500">Start Date</label>
              <input
                type="date"
                className="w-full mt-1 p-3 border rounded-lg"
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">End Date</label>
              <input
                type="date"
                className="w-full mt-1 p-3 border rounded-lg"
                value={form.endDate}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Reason</label>
              <textarea
                className="w-full mt-1 p-3 border rounded-lg"
                rows={3}
                value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-medium text-white hover:bg-brand-dark transition"
            >
              <Plus size={18} /> Submit
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2 border-t-4 border-gray-300">
          <p className="text-sm font-bold text-gray-700 mb-4">My Requests</p>

          {loading ? (
            <div className="text-gray-400">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-gray-400">No requests yet</div>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => (
                <div key={r._id} className="border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{r.type}</span>
                        <span className={pill(r.status)}>{r.status}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1 font-mono">
                        {r.startDate} → {r.endDate}
                      </div>
                      {r.reason ? <div className="text-xs text-gray-500 mt-1">Reason: {r.reason}</div> : null}
                      {r.decisionRemarks ? <div className="text-xs text-gray-500 mt-1">HR: {r.decisionRemarks}</div> : null}
                    </div>

                    {r.status === 'Pending' ? (
                      <button
                        onClick={() => cancel(r._id)}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition"
                        title="Cancel"
                      >
                        <X size={16} /> Cancel
                      </button>
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

export default MyLeave;
