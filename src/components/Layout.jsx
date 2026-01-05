import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Users, UserPlus, FileClock, Calendar, LifeBuoy, UploadCloud, Share2, CheckSquare, Archive,FileSpreadsheet } from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path
    ? "bg-brand-medium text-white"
    : "text-gray-300 hover:bg-brand-medium/50 hover:text-white";

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark shadow-xl flex flex-col">
        <div className="p-6 border-b border-brand-light">
          <h1 className="text-2xl font-bold text-white tracking-wider">IMS<span className="text-brand-light">PRO</span></h1>
          <p className="text-xs text-gray-400 mt-1">System v1.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">

          {/* DASHBOARD */}
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/dashboard')}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          {/* ADMIN: UPLOAD */}
          {role === 'Admin' && (
            <button
              onClick={() => navigate('/admin-upload')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin-upload')}`}
            >
              <UploadCloud size={20} />
              <span>Upload Data</span>
            </button>
          )}

          {/* MANAGERS: DISTRIBUTE LEADS */}
          {role !== 'Employee' && (
            <button
              onClick={() => navigate('/distribute')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/distribute')}`}
            >
              <Share2 size={20} />
              <span>Distribute Leads</span>
            </button>
          )}

          {/* ADMIN: UPLOAD & HISTORY */}
{role === 'Admin' && (
  <>
    

    {/* 2. View History (ADD THIS BUTTON) */}
    <button
      onClick={() => navigate('/uploads')}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/uploads')}`}
    >
      <FileSpreadsheet size={20} />
      <span>Upload History</span>
    </button>
  </>
)}

          {/* TASKS (Everyone) */}
          <button
            onClick={() => navigate('/tasks')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/tasks')}`}
          >
            <CheckSquare size={20} />
            <span>Task List</span>
          </button>

          {/* MY LEADS (Everyone EXCEPT Admin) */}
          {role !== 'Admin' && (
            <button
              onClick={() => navigate('/my-leads')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/my-leads')}`}
            >
              <Users size={20} />
              <span>My Leads</span>
            </button>
          )}

          {/* ADMIN ONLY: DEAD ARCHIVE */}
          {role === 'Admin' && (
            <button
              onClick={() => navigate('/archive')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/archive')}`}
            >
              <Archive size={20} />
              <span>Dead Archive</span>
            </button>
          )}

          {/* ADD MEMBER (Managers Only) */}
          {role !== 'Employee' && (
            <button
              onClick={() => navigate('/team')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/team')}`}
            >
              <UserPlus size={20} />
              <span>Add Member</span>
            </button>
          )}

          {/* SUPPORT / TICKETS */}
          <button
            onClick={() => navigate(
              (role === 'Admin' || role === 'BranchManager') ? '/admin-tickets' : '/raise-ticket'
            )}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive((role === 'Admin' || role === 'BranchManager') ? '/admin-tickets' : '/raise-ticket')
              }`}
          >
            <LifeBuoy size={20} />
            <span>{(role === 'Admin' || role === 'BranchManager') ? 'Support Desk' : 'Raise Ticket'}</span>
          </button>

          {/* ATTENDANCE MONITOR (Admin Only) */}
          {role === 'Admin' && (
            <button
              onClick={() => navigate('/admin-attendance')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin-attendance')}`}
            >
              <Users size={20} />
              <span>Staff Attendance</span>
            </button>
          )}

          {/* MY ATTENDANCE HISTORY (Everyone EXCEPT Admin) */}
         {role !== 'Admin' && role !== 'BranchManager' && (
  <button
    onClick={() => navigate('/calendar')}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/calendar')}`}
  >
    <Calendar size={20} />
    <span>Attendance History</span>
  </button>
)}

        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-brand-light">
          <div className="mb-4 px-2">
            <p className="text-sm text-gray-300">Logged in as</p>
            <p className="font-semibold text-white">{role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;