import React, { useMemo, useState } from 'react';
import api from '../api/axios';
import { BadgeDollarSign, Search, Wand2, FileText, Lock, RefreshCw, Save } from 'lucide-react';

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const HrPayroll = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [runId, setRunId] = useState('');
  const [run, setRun] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [includeTL, setIncludeTL] = useState(true);
  const [includeEmp, setIncludeEmp] = useState(true);
  const [search, setSearch] = useState('');

  const rolesPayload = useMemo(() => {
    const roles = [];
    if (includeTL) roles.push('TeamLead');
    if (includeEmp) roles.push('Employee');
    return roles;
  }, [includeTL, includeEmp]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const u = it.user || {};
      return (
        String(u.name || '').toLowerCase().includes(q) ||
        String(u.email || '').toLowerCase().includes(q) ||
        String(u.role || '').toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const selected = useMemo(() => items.find((i) => i._id === selectedId), [items, selectedId]);

  const loadRun = async (id) => {
    if (!id) return;
    try {
      setError('');
      setLoading(true);
      const res = await api.get(`/hr/payroll/${id}`);
      setRun(res.data.run);
      const newItems = res.data.items || [];
      setItems(newItems);
      if (!selectedId && newItems.length) setSelectedId(newItems[0]._id);
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

  const refresh = async () => {
    if (!runId) return;
    await loadRun(runId);
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

  const updateLocal = (id, updater) => {
    setItems((prev) => prev.map((it) => (it._id === id ? updater(it) : it)));
  };

  const saveItem = async (id) => {
    const it = items.find((x) => x._id === id);
    if (!it) return;

    try {
      setError('');
      setLoading(true);

      await api.patch(`/hr/payroll/item/${id}`, {
        attendance: {
          workingDays: num(it.attendance?.workingDays),
          attendanceDays: num(it.attendance?.attendanceDays)
        },
        manual: {
          designation: it.manual?.designation || '',
          basicSalary: num(it.manual?.basicSalary),
          incentive: num(it.manual?.incentive),
          deduction: num(it.manual?.deduction),
          allowances: num(it.manual?.allowances),
          remarks: it.manual?.remarks || ''
        }
      });

      await loadRun(runId);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.msg || 'Failed to save payroll item');
    } finally {
      setLoading(false);
    }
  };

  const openPayslip = async (payrollItemId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

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
  };

  const calcPreview = (it) => {
    const wd = num(it.attendance?.workingDays);
    const ad = num(it.attendance?.attendanceDays);
    const basic = num(it.manual?.basicSalary);
    const incentive = num(it.manual?.incentive);
    const allowances = num(it.manual?.allowances);
    const deduction = num(it.manual?.deduction);

    const gross = wd > 0 ? Math.round((basic * ad) / wd) : 0;
    const net = Math.max(0, Math.round(gross + incentive + allowances - deduction));
    const absent = Math.max(0, wd - ad);

    return { gross, net, absent };
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-2">
          <BadgeDollarSign size={32} /> Payroll
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={!runId || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition disabled:opacity-50"
          >
            <RefreshCw size={18} /> Refresh
          </button>

          <button
            onClick={finalize}
            disabled={!runId || loading || run?.status === 'Finalized'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-dark text-white hover:bg-black transition disabled:opacity-50"
            title="Lock payroll so it can't be edited"
          >
            <Lock size={18} /> Finalize
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-4">
          {error}
        </div>
      )}

      {/* Generate Run */}
      <div className="bg-white rounded-xl shadow-lg p-5 border-t-4 border-brand-medium mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500">Month</label>
            <input
              type="number"
              min="1"
              max="12"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-gray-500">Include Roles</label>
            <div className="flex gap-3 mt-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeTL}
                  onChange={(e) => setIncludeTL(e.target.checked)}
                />
                TeamLead
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeEmp}
                  onChange={(e) => setIncludeEmp(e.target.checked)}
                />
                Employee
              </label>
            </div>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={generate}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-medium text-white hover:bg-brand-dark transition disabled:opacity-50"
            >
              <Wand2 size={18} /> Generate Payroll
            </button>
          </div>
        </div>

        {run ? (
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-semibold">Run:</span> {run._id} •{' '}
            <span className="font-semibold">Status:</span> {run.status}
          </div>
        ) : null}
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Employee list */}
        <div className="bg-white rounded-xl shadow-lg p-4 border-t-4 border-brand-medium">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-700">Employees</p>
            <span className="text-xs text-gray-500">{filtered.length}</span>
          </div>

          <div className="relative mb-3">
            <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input
              className="w-full pl-10 pr-3 py-3 border rounded-lg"
              placeholder="Search name/email/role"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading && items.length === 0 ? (
            <div className="text-gray-400">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-gray-400">No payroll items</div>
          ) : (
            <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
              {filtered.map((it) => {
                const u = it.user || {};
                const active = it._id === selectedId;
                return (
                  <button
                    key={it._id}
                    onClick={() => setSelectedId(it._id)}
                    className={
                      active
                        ? 'w-full text-left p-3 rounded-lg bg-brand-medium text-white'
                        : 'w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100'
                    }
                  >
                    <div className="font-semibold">{u.name || '—'}</div>
                    <div className={active ? 'text-xs text-white/80' : 'text-xs text-gray-500'}>
                      {u.role || '—'} • {u.email || '—'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-3 border-t-4 border-gray-300">
          {!selected ? (
            <div className="text-gray-400">Select an employee</div>
          ) : (
            (() => {
              const u = selected.user || {};
              const preview = calcPreview(selected);
              const locked = run?.status === 'Finalized';

              return (
                <div className="space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-xl font-bold text-gray-900">{u.name || '—'}</div>
                      <div className="text-sm text-gray-500">{u.email || '—'} • {u.role || '—'}</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openPayslip(selected._id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition"
                      >
                        <FileText size={18} /> Payslip PDF
                      </button>

                      <button
                        onClick={() => saveItem(selected._id)}
                        disabled={loading || locked}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-medium text-white hover:bg-brand-dark transition disabled:opacity-50"
                        title={locked ? 'Payroll is finalized' : 'Save'}
                      >
                        <Save size={18} /> Save
                      </button>
                    </div>
                  </div>

                  {locked ? (
                    <div className="bg-yellow-50 text-yellow-900 border border-yellow-200 rounded-lg p-3 text-sm">
                      This payroll run is <b>Finalized</b>. Editing is disabled.
                    </div>
                  ) : null}

                  {/* Attendance parameters like your table */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Working Day</label>
                      <input
                        type="number"
                        className="w-full mt-1 p-3 border rounded-lg"
                        value={selected.attendance?.workingDays ?? 0}
                        onChange={(e) =>
                          updateLocal(selected._id, (it) => ({
                            ...it,
                            attendance: { ...it.attendance, workingDays: num(e.target.value) }
                          }))
                        }
                        disabled={locked}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500">Attendance</label>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full mt-1 p-3 border rounded-lg"
                        value={selected.attendance?.attendanceDays ?? 0}
                        onChange={(e) =>
                          updateLocal(selected._id, (it) => ({
                            ...it,
                            attendance: { ...it.attendance, attendanceDays: num(e.target.value) }
                          }))
                        }
                        disabled={locked}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500">Absent</label>
                      <input
                        className="w-full mt-1 p-3 border rounded-lg bg-gray-50"
                        value={preview.absent}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500">Designation</label>
                      <input
                        className="w-full mt-1 p-3 border rounded-lg"
                        value={selected.manual?.designation || ''}
                        onChange={(e) =>
                          updateLocal(selected._id, (it) => ({
                            ...it,
                            manual: { ...it.manual, designation: e.target.value }
                          }))
                        }
                        disabled={locked}
                      />
                    </div>
                  </div>

                  {/* Salary parameters like your table */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Basic Salary</label>
                      <input
                        type="number"
                        className="w-full mt-1 p-3 border rounded-lg"
                        value={selected.manual?.basicSalary ?? 0}
                        onChange={(e) =>
                          updateLocal(selected._id, (it) => ({
                            ...it,
                            manual: { ...it.manual, basicSalary: num(e.target.value) }
                          }))
                        }
                        disabled={locked}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500">Incentive</label>
                      <input
                        type="number"
                        className="w-full mt-1 p-3 border rounded-lg"
                        value={selected.manual?.incentive ?? 0}
                        onChange={(e) =>
                          updateLocal(selected._id, (it) => ({
                            ...it,
                            manual: { ...it.manual, incentive: num(e.target.value) }
                          }))
                        }
                        disabled={locked}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500">Allowances</label>
                      <input
                        type="number"
                        className="w-full mt-1 p-3 border rounded-lg"
                        value={selected.manual?.allowances ?? 0}
                        onChange={(e) =>
                          updateLocal(selected._id, (it) => ({
                            ...it,
                            manual: { ...it.manual, allowances: num(e.target.value) }
                          }))
                        }
                        disabled={locked}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500">Deduction</label>
                      <input
                        type="number"
                        className="w-full mt-1 p-3 border rounded-lg"
                        value={selected.manual?.deduction ?? 0}
                        onChange={(e) =>
                          updateLocal(selected._id, (it) => ({
                            ...it,
                            manual: { ...it.manual, deduction: num(e.target.value) }
                          }))
                        }
                        disabled={locked}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gray-50 border rounded-xl p-4">
                      <div className="text-xs text-gray-500">Gross Salary</div>
                      <div className="text-2xl font-bold text-gray-900">{preview.gross}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Basic × Attendance / Working
                      </div>
                    </div>

                    <div className="bg-gray-50 border rounded-xl p-4">
                      <div className="text-xs text-gray-500">Final Salary</div>
                      <div className="text-2xl font-bold text-gray-900">{preview.net}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Gross + Incentive + Allowances − Deduction
                      </div>
                    </div>

                    <div className="bg-gray-50 border rounded-xl p-4">
                      <div className="text-xs text-gray-500">Late Days (auto)</div>
                      <div className="text-2xl font-bold text-gray-900">{num(selected.attendance?.lateDays)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        From IMS attendance
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Remark</label>
                    <textarea
                      rows={3}
                      className="w-full mt-1 p-3 border rounded-lg"
                      value={selected.manual?.remarks || ''}
                      onChange={(e) =>
                        updateLocal(selected._id, (it) => ({
                          ...it,
                          manual: { ...it.manual, remarks: e.target.value }
                        }))
                      }
                      disabled={locked}
                      placeholder="e.g. No Deduction (1st month), 15% Deduction apply, Incentive Add"
                    />
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default HrPayroll;
