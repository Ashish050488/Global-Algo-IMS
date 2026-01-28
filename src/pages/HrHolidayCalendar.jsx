import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { CalendarDays, Plus, RefreshCw, Trash2 } from 'lucide-react';

const HrHolidayCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ title: '', date: '', description: '' });

  const fetchEvents = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await api.get('/calendar/events');
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const holidays = useMemo(() => {
    return (events || [])
      .filter((e) => e?.type === 'Holiday')
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [events]);

  const handleSync = async () => {
    try {
      setError('');
      setSaving(true);
      await api.post('/calendar/bulk-sync');
      await fetchEvents();
    } catch (e) {
      console.error(e);
      setError('Failed to sync holidays');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) {
      setError('Title and Date are required');
      return;
    }

    try {
      setError('');
      setSaving(true);
      await api.post('/calendar/events', {
        title: form.title,
        date: form.date,
        type: 'Holiday',
        description: form.description
      });
      setForm({ title: '', date: '', description: '' });
      await fetchEvents();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.msg || 'Failed to add holiday');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      setSaving(true);
      await api.delete(`/calendar/events/${id}`);
      await fetchEvents();
    } catch (e) {
      console.error(e);
      setError('Failed to delete event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-2">
          <CalendarDays size={32} /> Holiday Calendar
        </h1>
        <div className="flex gap-2">
          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
            disabled={saving}
          >
            <RefreshCw size={18} /> Refresh
          </button>
          <button
            onClick={handleSync}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-medium text-white hover:bg-brand-dark transition"
            disabled={saving}
          >
            <RefreshCw size={18} /> Sync India Holidays
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-brand-medium">
          <p className="text-sm font-bold text-gray-700 mb-4">Add Holiday</p>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Title *</label>
              <input
                className="w-full mt-1 p-3 border rounded-lg"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Republic Day"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Date *</label>
              <input
                type="date"
                className="w-full mt-1 p-3 border rounded-lg"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Description</label>
              <textarea
                className="w-full mt-1 p-3 border rounded-lg"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-medium text-white hover:bg-brand-dark transition"
            >
              <Plus size={18} /> Add
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2 border-t-4 border-gray-300">
          <p className="text-sm font-bold text-gray-700 mb-4">Holidays ({holidays.length})</p>
          {loading ? (
            <div className="text-gray-400">Loading…</div>
          ) : holidays.length === 0 ? (
            <div className="text-gray-400">No holidays found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2">Date</th>
                    <th className="py-2">Title</th>
                    <th className="py-2">Source</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((h) => (
                    <tr key={h._id} className="border-b last:border-b-0">
                      <td className="py-2 font-mono text-gray-900">{h.date}</td>
                      <td className="py-2 text-gray-900">
                        <div className="font-semibold">{h.title}</div>
                        {h.description ? (
                          <div className="text-xs text-gray-500 line-clamp-2">{h.description}</div>
                        ) : null}
                      </td>
                      <td className="py-2">
                        {h.isGlobal ? (
                          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">System</span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-brand-medium/10 text-brand-dark text-xs">Manual</span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => handleDelete(h._id)}
                          disabled={saving}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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
    </div>
  );
};

export default HrHolidayCalendar;
