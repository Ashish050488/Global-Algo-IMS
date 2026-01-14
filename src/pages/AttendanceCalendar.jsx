import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api/axios';
import { ShieldCheck, Clock, UserCheck } from 'lucide-react';

const AttendanceCalendar = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [hrMode, setHrMode] = useState("holiday"); // 'holiday' or 'leave'
  const [loading, setLoading] = useState(false);
  
  const role = localStorage.getItem('role');
  // Define who sees the HR controls
  const isHR = ['Admin', 'BranchManager', 'HR', 'LeadManager'].includes(role);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Global Calendar Events (Holidays/Meetings)
      const eventsRes = await api.get('/calendar/events');
      
      // 2. Fetch Users (Only if HR, to populate the dropdown)
      if (isHR) {
        const usersRes = await api.get('/auth/downline'); 
        setUsers(usersRes.data);
      }

      // 3. Fetch My Attendance (To show personal history)
      // Note: This calendar primarily shows *your* view. 
      // HR actions update the database, but won't reflect here unless you select yourself.
      const myAttendanceRes = await api.get(`/attendance/calendar?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`);

      formatAndSetEvents(eventsRes.data, myAttendanceRes.data);
    } catch (err) {
      console.error("Failed to load calendar data", err);
    } finally {
      setLoading(false);
    }
  };

  const formatAndSetEvents = (calendarEvents, attendanceRecords) => {
    const formattedEvents = [
      // 1. Global Events (Holidays = Red, Manual Events = Blue)
      ...calendarEvents.map(evt => ({
        id: evt._id,
        title: evt.title,
        start: evt.date, // Format: YYYY-MM-DD
        backgroundColor: evt.isGlobal ? '#ef4444' : '#3b82f6', 
        borderColor: 'transparent',
        extendedProps: { type: 'event', isGlobal: evt.isGlobal }
      })),

      // 2. Attendance Records (My Personal History)
      ...attendanceRecords.map(rec => {
        let color = '#10b981'; // Default: Green (Present)
        let title = 'Present';

        if (rec.currentStatus === 'Paid Leave') {
          color = '#8b5cf6'; // Purple
          title = 'Paid Leave';
        } else if (rec.currentStatus === 'Half Day') {
          color = '#f59e0b'; // Amber
          title = 'Half Day';
        } else if (rec.isLate) {
          color = '#fcd34d'; // Yellow
          title = `Late (${rec.lateBy}m)`;
        }

        return {
          id: rec._id,
          title: title,
          start: rec.date,
          display: 'background', // Fills the entire day cell
          backgroundColor: color,
          extendedProps: { type: 'attendance' }
        };
      })
    ];

    setEvents(formattedEvents);
  };

  // --- INTERACTION HANDLERS ---

  const handleDateClick = async (arg) => {
    if (!isHR) return; // Regular employees can't click to add

    // MODE A: HOLIDAY MANAGEMENT
    if (hrMode === "holiday") {
      const title = prompt(`Create Holiday on ${arg.dateStr}? Enter Name:`);
      if (title) {
        try {
          // Calls the Calendar Controller
          await api.post('/calendar/events', { 
            title, 
            date: arg.dateStr, 
            type: 'Holiday',
            description: 'Manual Entry' 
          });
          fetchInitialData(); // Refresh UI
        } catch (err) {
          alert("Failed to save holiday");
        }
      }
    } 
    // MODE B: EMPLOYEE LEAVE MARKING
    else {
      if (!selectedUser) return alert("⚠️ Please select an employee from the dropdown first!");
      
      const type = prompt(`Marking for ${arg.dateStr}.\nType 'P' for Paid Leave\nType 'H' for Half Day`).toUpperCase();
      const status = type === 'P' ? 'Paid Leave' : type === 'H' ? 'Half Day' : null;

      if (status) {
        const remarks = prompt("Enter Remarks (Optional):") || "HR Manual Mark";
        try {
          // Calls the Attendance Controller (New HR Endpoint)
          await api.post('/attendance/hr-mark', { 
            userId: selectedUser, 
            date: arg.dateStr, 
            status,
            remarks
          });
          alert(`Success! Marked ${status} for the selected user.`);
        } catch (err) {
          alert(err.response?.data?.msg || "Failed to mark attendance");
        }
      }
    }
  };

  const handleEventClick = async (info) => {
    if (!isHR) return;
    
    // Only allow deleting Calendar Events (Holidays/Meetings)
    // We don't delete attendance records this way to preserve history
    if (info.event.extendedProps.type === 'event') {
        if (window.confirm(`Remove event: "${info.event.title}"?`)) {
            try {
                await api.delete(`/calendar/events/${info.event.id}`);
                info.event.remove(); // Optimistic update
            } catch (err) {
                alert("Failed to delete");
            }
        }
    }
  };

  const syncHolidays = async () => {
    if(!window.confirm("Import official Indian Holidays for the current year?")) return;
    try {
      const res = await api.post('/calendar/bulk-sync');
      alert(res.data.msg);
      fetchInitialData();
    } catch (err) {
      alert("Sync failed. Check console.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Clock className="text-brand-medium" /> Attendance & Scheduling
            </h1>
            <p className="text-sm text-gray-500">View holidays, shifts, and personal attendance history.</p>
        </div>
        
        {/* SYNC BUTTON (Visible only to HR) */}
        {isHR && (
           <button 
             onClick={syncHolidays}
             className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm font-bold transition"
           >
             <ShieldCheck size={16} className="text-green-600"/> Sync Indian Holidays
           </button>
        )}
      </div>

      {/* HR CONTROL PANEL (Visible only to HR) */}
      {isHR && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 border-l-4 border-indigo-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            
            {/* TOGGLE MODE */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Action Mode</label>
              <select 
                className="border border-gray-300 rounded p-2 font-bold text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-200 bg-gray-50"
                value={hrMode}
                onChange={(e) => setHrMode(e.target.value)}
              >
                <option value="holiday">Manage Holidays</option>
                <option value="leave">Mark Employee Leave</option>
              </select>
            </div>

            {/* EMPLOYEE SELECTOR (Only visible in Leave Mode) */}
            {hrMode === "leave" && (
              <div className="flex flex-col animate-fadeIn">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Select Staff</label>
                <div className="relative">
                    <UserCheck className="absolute left-2 top-2.5 text-gray-400" size={14}/>
                    <select 
                    className="border border-gray-300 rounded p-2 pl-7 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white w-48"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    >
                    <option value="">-- Choose User --</option>
                    {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                    </select>
                </div>
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs text-indigo-600 font-bold flex items-center justify-end gap-1">
               HR OVERRIDE ACTIVE <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
                {hrMode === 'holiday' 
                    ? "Click any date to add a Holiday." 
                    : "Select a user, then click a date to mark Leave."}
            </p>
          </div>
        </div>
      )}

      {/* CALENDAR COMPONENT */}
      <div className="bg-white p-6 rounded-xl shadow-xl flex-1 border border-gray-100">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          
          // Interactions
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          
          // Data Binding
          events={events}
          
          // UI Config
          height="auto"
          contentHeight="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
          eventDisplay="block"
          dayMaxEvents={true}
        />
      </div>
    </div>
  );
};

export default AttendanceCalendar;