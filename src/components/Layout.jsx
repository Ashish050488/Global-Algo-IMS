import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, LogOut, Users, UserPlus, FileClock,
  Calendar, LifeBuoy, UploadCloud, Share2, CheckSquare,
  Archive, FileSpreadsheet, ShieldCheck, Briefcase,
  Network, BadgeDollarSign, UsersRound
} from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActive = (path) =>
    location.pathname === path
      ? "bg-brand-medium text-white"
      : "text-gray-300 hover:bg-brand-medium/50 hover:text-white";

  // Helper to check if the user has HR-level permissions
  const isManagement = role === 'Admin' || role === 'BranchManager' || role === 'HR';

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark shadow-xl flex flex-col">
        <div className="p-6 border-b border-brand-light">
          <h1 className="text-2xl font-bold text-white tracking-wider">
            IMS<span className="text-brand-light">PRO</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">System v1.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

          {/* 1. DASHBOARD (Everyone) */}
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/dashboard')}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          {/* 2. TEAM'S NEW HR MODULES (Strictly HR Role) */}
          {role === 'HR' && (
            <>
              <div className="pt-4 pb-1 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">HR Operations</div>
              <button
                onClick={() => navigate('/hr/headcount')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/hr/headcount')}`}
              >
                <UsersRound size={20} />
                <span>Headcount</span>
              </button>

              <button
                onClick={() => navigate('/hr/org-chart')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/hr/org-chart')}`}
              >
                <Network size={20} />
                <span>Org Chart</span>
              </button>

              <button
                onClick={() => navigate('/hr/payroll')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/hr/payroll')}`}
              >
                <BadgeDollarSign size={20} />
                <span>Payroll</span>
              </button>
            </>
          )}

          {/* 3. YOUR CALENDAR/HOLIDAY MANAGER (Admin/BM/HR) */}
          {/* This co-exists with the team's modules */}
          <button
            onClick={() => navigate('/calendar')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/calendar')}`}
          >
            {isManagement ? <ShieldCheck size={20} /> : <Calendar size={20} />}
            <span>{isManagement ? 'HR & Calendar' : 'Attendance History'}</span>
          </button>

          {/* 4. DATA OPS: UPLOAD & HISTORY (Admin OR LeadManager) */}
          {(role === 'Admin' || role === 'LeadManager') && (
            <>
              <div className="pt-4 pb-1 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Data Operations</div>
              <button
                onClick={() => navigate('/admin-upload')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin-upload')}`}
              >
                <UploadCloud size={20} />
                <span>Upload Data</span>
              </button>

              <button
                onClick={() => navigate('/uploads')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/uploads')}`}
              >
                <FileSpreadsheet size={20} />
                <span>Upload History</span>
              </button>
            </>
          )}

          {/* 5. DISTRIBUTION (Managers OR LeadManager) */}
          {((role !== 'Employee' && role !== 'HR') || role === 'LeadManager') && (
            <button
              onClick={() => navigate('/distribute')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/distribute')}`}
            >
              <Share2 size={20} />
              <span>Distribute Leads</span>
            </button>
          )}

          {/* 6. ARCHIVE (Admin OR LeadManager) */}
          {(role === 'Admin' || role === 'LeadManager') && (
            <button
              onClick={() => navigate('/archive')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/archive')}`}
            >
              <Archive size={20} />
              <span>Dead Archive</span>
            </button>
          )}

          <div className="pt-4 pb-1 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Personal & Support</div>

          {/* TASKS */}
          {role !== 'LeadManager' && (
            <button
              onClick={() => navigate('/tasks')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/tasks')}`}
            >
              <CheckSquare size={20} />
              <span>Task List</span>
            </button>
          )}

          {/* MY LEADS */}
          {role !== 'Admin' && role !== 'LeadManager' && role !== 'HR' && (
            <button
              onClick={() => navigate('/my-leads')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/my-leads')}`}
            >
              <Users size={20} />
              <span>My Leads</span>
            </button>
          )}

          {/* TEAM MANAGEMENT */}
          {role !== 'Employee' && role !== 'LeadManager' && (
            <button
              onClick={() => navigate('/team')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/team')}`}
            >
              <UserPlus size={20} />
              <span>Add Member</span>
            </button>
          )}

          {/* SUPPORT DESK */}
          {role !== 'LeadManager' && (
            <button
              onClick={() => navigate(
                (role === 'Admin' || role === 'BranchManager' || role === 'HR') ? '/admin-tickets' : '/raise-ticket'
              )}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive((role === 'Admin' || role === 'BranchManager' || role === 'HR') ? '/admin-tickets' : '/raise-ticket')}`}
            >
              <LifeBuoy size={20} />
              <span>Support Desk</span>
            </button>
          )}

          {/* REAL-TIME FLOOR (Renamed from Attendance, but includes team's 'HR' permission) */}
          {(role === 'Admin' || role === 'BranchManager' || role === 'HR') && (
            <button
              onClick={() => navigate('/admin-attendance')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin-attendance')}`}
            >
              <Users size={20} />
              <span>Real-time Floor</span>
            </button>
          )}

        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-brand-light bg-brand-dark/50">
          <div className="mb-4 px-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-medium flex items-center justify-center text-white font-bold text-xs">
              {role ? role[0] : 'U'}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Role</p>
              <p className="text-sm font-semibold text-white leading-tight">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition-colors font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;