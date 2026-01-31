import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, User, Check, X, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminAttendance = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 1. Load Users (FILTERED)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/all-users');
        
        // FIX: Filter out Admin and BranchManager. 
        // Only show people who actually mark attendance (TeamLead & Employee)
        const trackableStaff = res.data.filter(u => 
          u.role === 'TeamLead' || u.role === 'Employee'
        );
        
        setUsers(trackableStaff);
      } catch (err) {
        console.error("Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  // 2. Fetch Data when User or Date changes
  useEffect(() => {
    if (selectedUser) {
      fetchUserAttendance();
    } else {
        setRecords([]); // Clear if no user selected
    }
  }, [selectedUser, currentDate]);

  const fetchUserAttendance = async () => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    try {
      const res = await api.get(`/attendance/calendar?month=${month}&year=${year}&targetUserId=${selectedUser}`);
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to fetch calendar");
    }
  };

  // --- HELPER LOGIC ---
  const MAX_OFFLINE_SECONDS = 59400; // 16.5 hours

  const getDayStatus = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = records.find(r => r.date === dateStr);
    
    const checkDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Future Date
    if (checkDate > today) return { type: 'future', label: '' };
    
    // Absent (No Record)
    if (!record) return { type: 'absent', label: 'Absent' };

    // Over Limit (Buffer Violation)
    const offlineSeconds = record.durations?.Offline || 0;
    if (offlineSeconds > MAX_OFFLINE_SECONDS) {
      return { type: 'absent', label: 'Over Limit' };
    }
    
    // Calculate total worked hours (Online + On-call)
    const online = record.durations?.Online || 0;
    const onCall = record.durations?.['On-call'] || 0;
    const workHours = ((online + onCall) / 3600).toFixed(1);

    // Check Late Status
    if (record.isLate) {
      return { 
        type: 'late', 
        label: `Late: ${record.lateBy}m`, 
        subLabel: `${workHours} hrs`
      };
    }

    // Present (On Time)
    return { type: 'present', label: 'On Time', subLabel: `${workHours} hrs` };
  };

  // --- CALENDAR GRID GENERATION ---
  const getCalendarLayout = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon...
    
    const blanks = Array(firstDayOfWeek).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    return { blanks, days };
  };

  const { blanks, days } = getCalendarLayout();

  // --- NAVIGATION CONTROLS ---
  const today = new Date();
  
  // Disable Next if showing Current Month
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                        currentDate.getFullYear() === today.getFullYear();

  // Find selected user's joining date to Disable Prev
  const currentUserData = users.find(u => u._id === selectedUser);
  const joiningDate = new Date(currentUserData?.createdAt || '2024-01-01'); 
  const isJoiningMonth = currentDate.getMonth() === joiningDate.getMonth() && 
                        currentDate.getFullYear() === joiningDate.getFullYear();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-dark mb-6 flex items-center gap-2">
        <User size={32} /> Staff Attendance Monitor
      </h1>

      {/* USER SELECTOR */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-brand-medium mb-8">
        <label className="block text-sm font-bold text-gray-700 mb-2">Select Employee to View</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <select 
            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-brand-medium outline-none bg-gray-50"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">-- Choose a Team Member --</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CALENDAR VIEW */}
      {selectedUser ? (
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-gray-400">
          <div className="flex justify-between items-center mb-6">
             <h2 className="font-bold text-lg text-gray-700">
               Attendance for {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
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

          <div className="grid grid-cols-7 gap-4">
            {/* Header Row */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center font-bold text-gray-400 uppercase text-xs mb-2">{d}</div>
            ))}
            
            {/* Blank Fillers for offset */}
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="min-h-20 bg-transparent"></div>
            ))}

            {/* Actual Days */}
            {days.map(day => {
              const status = getDayStatus(day);
              let bgClass = "bg-gray-50 border-gray-200 text-gray-400"; // Default
              
              if (status.type === 'present') bgClass = "bg-green-50 border-green-200 text-green-800";
              if (status.type === 'absent') bgClass = "bg-red-50 border-red-200 text-red-800";
              if (status.type === 'late') bgClass = "bg-yellow-50 border-yellow-300 text-yellow-800";

              return (
                <div key={day} className={`border rounded-lg p-3 min-h-20 flex flex-col justify-between transition hover:shadow-md ${bgClass}`}>
                  <span className="font-bold text-md">{day}</span>
                  <div className="text-xs font-bold flex flex-col gap-1">
                    {status.type !== 'future' && (
                      <div className="flex items-center gap-1">
                        {status.type === 'present' && <Check size={12} />}
                        {status.type === 'absent' && <X size={12} />}
                        {status.type === 'late' && <AlertTriangle size={12} />}
                        {status.label}
                      </div>
                    )}
                    {status.subLabel && <span className="opacity-75 font-mono">{status.subLabel}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">
          <User size={48} className="mx-auto mb-2 opacity-20" />
          <p>Please select an employee to view their records.</p>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;