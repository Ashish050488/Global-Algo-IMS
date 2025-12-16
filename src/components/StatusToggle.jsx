import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, Coffee, Phone, UserCheck, Moon, Laptop, Utensils } from 'lucide-react';

const StatusToggle = () => {
  const [status, setStatus] = useState('Offline');
  const [durations, setDurations] = useState({}); 
  const [loading, setLoading] = useState(false);
  
  // Get User Role to decide what buttons to show
  const role = localStorage.getItem('role');

  // --- 1. SETUP TIMERS ---
  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (status !== 'Offline') {
        setDurations(prev => ({
          ...prev,
          [status]: (prev[status] || 0) + 1
        }));
      }
    }, 1000); 

    const syncInterval = setInterval(fetchStatus, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, [status]);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/attendance/current');
      setStatus(res.data.currentStatus || 'Offline');
      setDurations(res.data.durations || {});
    } catch (err) {
      console.error("Failed to fetch status");
    }
  };

  const changeStatus = async (newStatus) => {
    if (newStatus === status) return;
    
    // Only Employees need approval logic for Evaluation
    if (newStatus === 'Evaluation') {
      const confirm = window.confirm("Requesting 'Evaluation'. Proceed?");
      if (!confirm) return;
    }

    setLoading(true);
    try {
      const res = await api.post('/attendance/status', { newStatus });
      setStatus(res.data.currentStatus);
      setDurations(res.data.durations);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to change status");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds) => {
    if (!totalSeconds) return "00s";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const getTimeStyle = (seconds, limitInMinutes) => {
    if (!limitInMinutes) return "text-gray-700";
    const limitSeconds = limitInMinutes * 60;
    return seconds > limitSeconds ? "text-red-600 font-bold animate-pulse" : "text-gray-700";
  };

  const getButtonColor = (key) => {
    if (status === key) return "bg-brand-medium text-white shadow-lg ring-2 ring-blue-300 transform scale-105"; 
    return "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"; 
  };

  // --- 2. DEFINE BUTTONS ---
  const ALL_OPTIONS = [
    { key: 'Online', icon: <Laptop size={16} />, allowed: ['BranchManager', 'HR', 'Employee'] },
    { key: 'On-call', icon: <Phone size={16} />, allowed: ['Employee'] }, // Employee ONLY
    { key: 'Break', icon: <Coffee size={16} />, allowed: ['BranchManager', 'HR', 'Employee'] },
    { key: 'Lunch Time', icon: <Utensils size={16} />, allowed: ['BranchManager', 'HR', 'Employee'] },
    { key: 'Evaluation', icon: <UserCheck size={16} />, allowed: ['Employee'] }, // Employee ONLY
    { key: 'Offline', icon: <Moon size={16} />, allowed: ['BranchManager', 'HR', 'Employee'] },
  ];

  // --- 3. FILTER BUTTONS BASED ON ROLE ---
  const visibleOptions = ALL_OPTIONS.filter(opt => opt.allowed.includes(role));

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border-t-4 border-brand-light mb-8">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
        <h3 className="font-bold text-brand-dark flex items-center gap-2 text-lg">
          <Clock size={20} /> 
          Live Status: <span className="text-brand-medium uppercase tracking-wider">{status}</span>
        </h3>
        <span className="text-xs text-green-600 font-mono animate-pulse">● LIVE TRACKING</span>
      </div>

      <div className={`grid gap-3 mb-6 ${role === 'Employee' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-4'}`}>
        {visibleOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => changeStatus(opt.key)}
            disabled={loading}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all text-sm font-medium ${getButtonColor(opt.key)}`}
          >
            <div className="mb-1">{opt.icon}</div>
            {opt.key}
          </button>
        ))}
      </div>

      {/* TIMERS DISPLAY (Only show counters for things the user can actually do) */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <p className="font-bold text-gray-400 uppercase text-xs mb-3 tracking-wide">Time Utilization (Today)</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-8 text-sm font-mono">
          
          <div className="flex justify-between">
            <span>💻 Online:</span> 
            <b className="text-brand-dark">{formatTime(durations.Online)}</b>
          </div>
          
          {role === 'Employee' && (
            <div className="flex justify-between">
              <span>📞 On-call:</span> 
              <b className="text-brand-dark">{formatTime(durations['On-call'])}</b>
            </div>
          )}

          <div className="flex justify-between">
            <span>☕ Break:</span> 
            <span className={getTimeStyle(durations.Break, 20)}>
              {formatTime(durations.Break)} / 20m
            </span>
          </div>

          <div className="flex justify-between">
            <span>🍔 Lunch:</span> 
            <span className={getTimeStyle(durations['Lunch Time'], 40)}>
              {formatTime(durations['Lunch Time'])} / 40m
            </span>
          </div>

          {role === 'Employee' && (
            <div className="flex justify-between">
              <span>📋 Evaluation:</span> 
              <b>{formatTime(durations.Evaluation)}</b>
            </div>
          )}

          <div className="flex justify-between">
            <span>🌙 Offline:</span> 
            <span className={getTimeStyle(durations.Offline, 960)}>
              {formatTime(durations.Offline)}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatusToggle;