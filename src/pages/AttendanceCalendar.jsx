import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, Check, X, AlertTriangle, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AttendanceCalendar = () => {
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [joiningDate, setJoiningDate] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NEW: Navigation & Role Check
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  // --- SECURITY GATEKEEPER ---
  useEffect(() => {
    // If user is Admin or BranchManager, they have NO business here.
    if (role === 'Admin' || role === 'BranchManager') {
      navigate('/dashboard'); // Kick them to Dashboard
    }
  }, [role, navigate]);

  // 2. Fetch Month Data whenever Date Changes
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
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: 16 Hours 30 Mins Rule ---
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
      return { type: 'absent', label: 'Over Limit' };
    }

    // 5. Late Check
    if (record.isLate) {
        return { type: 'late', label: `Late: ${record.lateBy}m` };
    }

    return { type: 'present', label: 'Present' };
  };

  // --- CALENDAR GRID GENERATION (ACCURATE) ---
  const getCalendarLayout = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Total days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Day of week the 1st falls on (0=Sun, 1=Mon...)
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    
    const blanks = Array(firstDayOfWeek).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    return { blanks, days };
  };

  const { blanks, days } = getCalendarLayout();

  // --- NAVIGATION LIMITS ---
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                        currentDate.getFullYear() === today.getFullYear();

  const isJoiningMonth = joiningDate && 
                        currentDate.getMonth() === joiningDate.getMonth() && 
                        currentDate.getFullYear() === joiningDate.getFullYear();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-2">
          <Calendar size={32} /> Attendance History
        </h1>
        
        {/* LEGEND */}
        <div className="flex gap-4 text-xs font-medium bg-white p-2 rounded-lg shadow-sm">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-500 rounded"></div> Present</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-50 border border-yellow-500 rounded"></div> Late</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-500 rounded"></div> Absent</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-brand-medium">
        
        {/* HEADER & NAV */}
        <div className="flex justify-between items-center mb-6">
             <h2 className="font-bold text-lg text-gray-700 capitalize">
               {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
             </h2>
             <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} 
                  disabled={isJoiningMonth}
                  className={`flex items-center gap-1 px-4 py-2 rounded text-sm font-bold transition ${
                    isJoiningMonth 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} 
                  disabled={isCurrentMonth}
                  className={`flex items-center gap-1 px-4 py-2 rounded text-sm font-bold transition ${
                    isCurrentMonth 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Next <ChevronRight size={16} />
                </button>
             </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-7 gap-4">
          {/* Weekday Header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center font-bold text-gray-400 uppercase text-xs mb-2">{d}</div>
          ))}
          
          {/* Blank Spaces */}
          {blanks.map((_, i) => (
             <div key={`b-${i}`} className="min-h-[100px]"></div>
          ))}

          {/* Days */}
          {days.map(day => {
            const status = getDayStatus(day);
            let bgClass = "bg-gray-50 border-gray-200 text-gray-400"; // Default/Future
            
            if (status.type === 'present') bgClass = "bg-green-50 border-green-200 text-green-800";
            if (status.type === 'late') bgClass = "bg-yellow-50 border-yellow-300 text-yellow-800";
            if (status.type === 'absent') bgClass = "bg-red-50 border-red-200 text-red-800";

            return (
              <div key={day} className={`border rounded-lg p-4 min-h-[100px] flex flex-col justify-between transition hover:shadow-md ${bgClass}`}>
                <span className="font-bold text-lg">{day}</span>
                <div className="text-xs font-bold flex flex-col gap-1">
                  {status.type !== 'future' && (
                    <div className="flex items-center gap-1">
                      {status.type === 'present' && <Check size={14} />}
                      {status.type === 'late' && <Clock size={14} />}
                      {status.type === 'absent' && <X size={14} />}
                      {status.label}
                    </div>
                  )}
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