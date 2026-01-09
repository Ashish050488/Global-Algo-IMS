
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, Shield, Users, CheckCircle, AlertCircle } from 'lucide-react';

const TeamManagement = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'BranchManager' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [mySubordinates, setMySubordinates] = useState([]);

  const myRole = localStorage.getItem('role');

  // --- 1. DETERMINE WHO I CAN CREATE ---
  const getChildRole = () => {
    if (myRole === 'Admin') return (formData.role === 'HR' ? 'HR' : 'BranchManager');
    if (myRole === 'HR' || myRole === 'BranchManager') return 'TeamLead';
    if (myRole === 'TeamLead') return 'Employee';
    return 'None';
  };

  const childRole = getChildRole();

  // --- 2. LOAD MY EXISTING TEAM ---
  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/auth/subordinates');
      setMySubordinates(res.data);
    } catch (err) {
      console.error("Failed to load team");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure? This will fire the employee and return their leads to you.")) return;

    try {
      await api.delete(`/auth/user/${userId}`);
      alert("User Removed.");
      fetchTeam();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  // --- 3. HANDLE CREATE USER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (childRole === 'None') return;

    try {
      setLoading(true);
      await api.post('/auth/register', formData);

      setMsg({ text: `Success! Created new ${childRole}: ${formData.name}`, type: 'success' });
      setFormData({ name: '', email: '', password: '', role: 'BranchManager' });
      fetchTeam();
    } catch (err) {
      setMsg({ text: err.response?.data?.msg || "Failed to create user", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (myRole === 'Employee') {
    return <div className="p-10 text-center">Access Denied: Employees cannot create users.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto flex gap-8">

      {/* --- LEFT PANEL: CREATE USER --- */}
      <div className="w-1/3 bg-white p-6 rounded-xl shadow-lg border-t-4 border-brand-medium h-fit">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus size={24} className="text-brand-dark" />
          <h2 className="text-xl font-bold text-brand-dark">Add New Member</h2>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
          <p className="text-xs text-blue-600 font-bold uppercase mb-1">YOUR ROLE: {myRole}</p>
          <p className="text-sm text-gray-700">
            You are authorized to create: <span className="font-bold text-brand-dark">{childRole}s</span>
          </p>
        </div>

        {msg.text && (
          <div className={`p-3 mb-4 rounded flex items-center gap-2 text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Only Admin chooses what to create: BranchManager or HR */}
          {myRole === 'Admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Create Role</label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-medium outline-none bg-gray-50"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="BranchManager">BranchManager</option>
                <option value="HR">HR</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Admin can create BranchManagers or HR.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-medium outline-none"
              placeholder={`e.g. John Doe (${childRole})`}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-medium outline-none"
              placeholder="john@company.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
            <input
              type="text"
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-medium outline-none"
              placeholder="e.g. 123456"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-medium text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition flex items-center justify-center gap-2"
          >
            {loading ? 'Creating...' : `Register ${childRole}`}
          </button>
        </form>
      </div>

      {/* --- RIGHT PANEL: MY TEAM LIST --- */}
      <div className="w-2/3 bg-white rounded-xl shadow-lg border-t-4 border-brand-light flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-brand-dark" />
            <h2 className="text-xl font-bold text-brand-dark">Your Direct Team</h2>
          </div>
          <span className="bg-brand-bg text-brand-dark px-3 py-1 rounded-full text-sm font-bold">
            Total: {mySubordinates.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {mySubordinates.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Shield size={48} className="mx-auto mb-2 opacity-20" />
              <p>You haven't added any {childRole}s yet.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mySubordinates.map(sub => (
                  <tr key={sub._id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-700">{sub.name}</td>
                    <td className="p-3 text-gray-500">{sub.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-brand-bg text-brand-dark rounded-md text-xs font-bold">
                        {sub.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold disabled:opacity-50"
                      >
                        Remove (Admin Only)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default TeamManagement;
