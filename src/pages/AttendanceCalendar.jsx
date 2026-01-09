import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api/axios';
import { ShieldCheck, User, Umbrella, Clock } from 'lucide-react';

const AttendanceCalendar = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [hrMode, setHrMode] = useState("holiday"); // 'holiday' or 'leave'
  
  const role = localStorage.getItem('role');
  const isHR = role === 'Admin' || role === 'BranchManager';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // FIX 1: Removed '/api' prefix
      const eventsRes = await api.get('/calendar/events');
      const usersRes = await api.get('/auth/downline');
      
      setUsers(usersRes.data);
      formatEvents(eventsRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  const formatEvents = (rawEvents) => {
    const formatted = rawEvents.map(evt => ({
      id: evt._id,
      title: evt.title,
      start: evt.date,
      // Global Holidays = Red, Manual Events = Blue
      backgroundColor: evt.isGlobal ? '#ef4444' : '#3b82f6',
      extendedProps: { 
        type: evt.type,
        isGlobal: evt.isGlobal 
      }
    }));
    setEvents(formatted);
  };

  // Logic to handle HR clicks on the calendar
  const handleDateClick = async (arg) => {
    if (!isHR) return;

    if (hrMode === "holiday") {
      const title = prompt("Enter Holiday Name (e.g., Diwali):");
      if (title) {
        // FIX 2: Removed '/api' prefix
        await api.post('/calendar/events', { title, date: arg.dateStr, type: 'Holiday' });
      }
    } else {
      if (!selectedUser) return alert("Please select an employee first!");
      const type = prompt("Type 'P' for Paid Leave or 'H' for Half Day:").toUpperCase();
      
      const status = type === 'P' ? 'Paid Leave' : type === 'H' ? 'Half Day' : null;
      if (status) {
        // FIX 3: Removed '/api' prefix
        await api.post('/attendance/hr-mark', { 
          userId: selectedUser, 
          date: arg.dateStr, 
          status,
          remarks: 'HR Manual Entry'
        });
        alert(`Marked ${status} for user`);
      }
    }
    fetchInitialData();
  };

  const handleEventClick = async (info) => {
    if (!isHR) return;
    
    // Allow deleting holidays
    if (window.confirm(`Remove holiday: ${info.event.title}?`)) {
       // FIX 4: Removed '/api' prefix
       await api.delete(`/calendar/events/${info.event.id}`);
       info.event.remove(); // Remove from UI instantly
    }
  };

  // --- NEW: THE SYNC BUTTON ---
  const syncHolidays = async () => {
    if(!window.confirm("Import official Indian Holidays for this year?")) return;
    try {
      // FIX 5: Removed '/api' prefix
      const res = await api.post('/calendar/bulk-sync');
      alert(res.data.msg);
      fetchInitialData();
    } catch (err) {
      alert("Sync failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Attendance & Holiday Manager</h1>
        
        {/* SYNC BUTTON FOR HR */}
        {isHR && (
           <button 
             onClick={syncHolidays}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 text-sm font-bold"
           >
             <Clock size={16} /> Sync Indian Holidays
           </button>
        )}
      </div>

      {isHR && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 border-l-4 border-red-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 uppercase">HR Mode</label>
              <select 
                className="border rounded p-1 font-bold text-sm outline-none focus:ring-2 focus:ring-red-200"
                value={hrMode}
                onChange={(e) => setHrMode(e.target.value)}
              >
                <option value="holiday">Create/Remove Holidays</option>
                <option value="leave">Mark Employee Leaves</option>
              </select>
            </div>

            {hrMode === "leave" && (
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-400 uppercase">Target Employee</label>
                <select 
                  className="border rounded p-1 text-sm outline-none focus:ring-2 focus:ring-red-200"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">-- Select Staff --</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-red-500 font-bold flex items-center justify-end gap-1">
               <ShieldCheck size={14}/> HR AUTHORIZATION ACTIVE
            </p>
            <p className="text-[10px] text-gray-400">Click a date to apply changes</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-xl">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          events={events}
          height="75vh"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
        />
      </div>
    </div>
  );
};

export default AttendanceCalendar;