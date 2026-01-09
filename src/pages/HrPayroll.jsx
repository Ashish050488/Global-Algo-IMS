import React, { useMemo, useState } from 'react';
import api from '../api/axios';
import { BadgeDollarSign, Search, Wand2, FileText, Lock, RefreshCw } from 'lucide-react';

const HrPayroll = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [runId, setRunId] = useState('');
  const [run, setRun] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [includeTL, setIncludeTL] = useState(true);
  const [includeEmp, setIncludeEmp] = useState(true);

  const rolesPayload = useMemo(() => {
    const roles = [];
    if (includeTL) roles.push('TeamLead');
    if (includeEmp) roles.push('Employee');
    return roles;
  }, [includeTL, includeEmp]);

  const loadRun = async (id) => {
    if (!id) return;
    try {
      setError('');
      setLoading(true);
      const res = await api.get(`/hr/payroll/${id}`);
      setRun(res.data.run);
      setItems(res.data.items || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load payroll run');
      setRun(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await api.post('/hr/payroll/generate', {
        month: Number(month),
        year: Number(year),
        includeRoles: rolesPayload
      });
      const id = res.data.runId;
      setRunId(id);
      await loadRun(id);
    } catch (e) {
      console.error(e);
      setError('Failed to generate payroll');
    } finally {
      setLoading(false);
    }
  };

  const finalize = async () => {
    if (!runId) return;
    try {
      setError('');
      setLoading(true);
      await api.post(`/hr/payroll/${runId}/finalize`);
      await loadRun(runId);
    } catch (e) {
      console.error(e);
      setError('Failed to finalize payroll');
    } finally {
      setLoading(false);
    }
  };

  const openPayslip = (payrollItemId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    (async () => {
      try {
        const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
        const url = `${base}/hr/payslip/${payrollItemId}/pdf`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Payslip download failed');

        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.error(e);
        setError('Failed to open payslip PDF');
      }
    })();
  };

  const totalNet = useMemo(() => {
    return (items || []).reduce((sum, it) => sum + (Number(it.netPay) || 0), 0);
  }, [items]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-2">
          <BadgeDollarSign size={32} /> Payroll
        </h1>
        <button
          onClick={() => runId && loadRun(runId)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-medium text-white hover:bg-brand-dark transition disabled:opacity-50"
          disabled={!runId || loading}
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-brand-medium lg:col-span-2">
          <p className="font-bold text-gray-700 mb-4">Generate Payroll (Draft)</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Month</label>
              <input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-brand-medium outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-brand-medium outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={generate}
                disabled={loading || rolesPayload.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-brand-medium hover:bg-brand-dark text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                <Wand2 size={18} /> {loading ? 'Working…' : 'Generate'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={includeTL} onChange={(e) => setIncludeTL(e.target.checked)} />
              TeamLeads
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={includeEmp} onChange={(e) => setIncludeEmp(e.target.checked)} />
              Employees
            </label>
          </div>

          {runId && (
            <div className="mt-4 text-sm text-gray-600">
              Last Run ID: <span className="font-mono text-gray-900">{runId}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-gray-300">
          <p className="font-bold text-gray-700 mb-4">Load Payroll Run</p>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={runId}
              onChange={(e) => setRunId(e.target.value)}
              placeholder="Paste runId here"
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-brand-medium outline-none"
            />
          </div>
          <button
            onClick={() => loadRun(runId)}
            disabled={!runId || loading}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            <Search size={18} /> Load
          </button>

          <div className="mt-5 border-t pt-4">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-bold text-gray-900">{run?.status || '—'}</p>
            <p className="text-xs text-gray-400 mt-1">
              Period: {run?.period ? `${String(run.period.month).padStart(2, '0')}/${run.period.year}` : '—'}
            </p>

            <button
              onClick={finalize}
              disabled={!runId || loading || run?.status === 'Finalized'}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              <Lock size={18} /> Finalize
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-t-4 border-brand-medium p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-gray-700">Payslips</p>
            <p className="text-xs text-gray-400">Open any payslip as a printable PDF</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Net Pay</p>
            <p className="text-xl font-extrabold text-gray-900">{totalNet.toLocaleString()}</p>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <div className="text-gray-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-400">No payroll items loaded.</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Present</th>
                  <th className="py-2">Late</th>
                  <th className="py-2">Net Pay</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it._id} className="border-b last:border-b-0">
                    <td className="py-3 font-semibold text-gray-800">{it.user?.name || '—'}</td>
                    <td className="py-3 text-gray-700">{it.user?.role || '—'}</td>
                    <td className="py-3 font-mono">{it.attendance?.presentDays ?? 0}</td>
                    <td className="py-3 font-mono">{it.attendance?.lateDays ?? 0}</td>
                    <td className="py-3 font-mono">{Number(it.netPay || 0).toLocaleString()}</td>
                    <td className="py-3">
                      <button
                        onClick={() => openPayslip(it._id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white transition"
                      >
                        <FileText size={16} /> Payslip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HrPayroll;
