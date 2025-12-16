import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, Check, X, Clock, AlertTriangle } from 'lucide-react';

const AttendanceCalendar = () => {
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchMonthData();
  }, [currentDate]);

  const fetchMonthData = async () => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    try {
      const res = await api.get(`/attendance/calendar?month=${month}&year=${year}`);
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to fetch calendar");
    }
  };

  // --- LOGIC: 16 Hours 30 Mins Rule ---
  // 16.5 hours = 59,400 seconds
  const MAX_OFFLINE_SECONDS = 59400; 

  const getDayStatus = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // 1. Find Record
    const record = records.find(r => r.date === dateStr);
    
    // 2. Future Date?
    const checkDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (checkDate > today) return { type: 'future', label: '' };

    // 3. No Record = Absent
    if (!record) return { type: 'absent', label: 'Absent' };

    // 4. Check Offline Limit
    const offlineSeconds = record.durations?.Offline || 0;
    
    if (offlineSeconds > MAX_OFFLINE_SECONDS) {
      return { type: 'absent', label: 'Over Limit (Absent)' };
    }

    return { type: 'present', label: 'Present' };
  };

  // Helper to generate calendar grid
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysArray = [...Array(daysInMonth).keys()].map(i => i + 1);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-2">
          <Calendar size={32} /> Attendance History
        </h1>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div> Present</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div> Absent/Over Limit</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-brand-medium">
        <div className="grid grid-cols-7 gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center font-bold text-gray-400 uppercase text-xs mb-2">{d}</div>
          ))}
          
          {/* Simple Grid Logic (You might want to add empty divs for offset based on day of week) */}
          {daysArray.map(day => {
            const status = getDayStatus(day);
            let bgClass = "bg-gray-50 border-gray-200 text-gray-400"; // Default/Future
            
            if (status.type === 'present') bgClass = "bg-green-50 border-green-200 text-green-800";
            if (status.type === 'absent') bgClass = "bg-red-50 border-red-200 text-red-800";

            return (
              <div key={day} className={`border rounded-lg p-4 min-h-[100px] flex flex-col justify-between transition hover:shadow-md ${bgClass}`}>
                <span className="font-bold text-lg">{day}</span>
                <div className="text-xs font-bold flex items-center gap-1">
                  {status.type === 'present' && <Check size={14} />}
                  {status.type === 'absent' && <X size={14} />}
                  {status.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 text-sm flex items-start gap-3">
        <AlertTriangle size={20} className="shrink-0" />
        <p>
          <strong>Policy Reminder:</strong> You are allowed a maximum of 16 hours and 30 minutes of "Offline" time per day. 
          Exceeding this buffer will automatically mark the day as <strong>Absent</strong> regardless of login time.
        </p>
      </div>
    </div>
  );
};

export default AttendanceCalendar;