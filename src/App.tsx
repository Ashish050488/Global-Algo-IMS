import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HouseDoor, FileEarmarkSpreadsheet, People, ClockHistory, BoxArrowRight } from 'react-bootstrap-icons';
import UsersPage from './pages/Admin/Users';
import UploadXlsxPage from './pages/Admin/UploadXlsx';
import IntakeExcel from './pages/Admin/IntakeExcel';
import TeamPerformance from './pages/Admin/TeamPerformance';
import ExportPage from './pages/Admin/ExportsPage';
import AuditPage from './pages/Admin/AuditPage';
import ReportsPage from './pages/Admin/ReportsPage';

// Placeholder for other Admin pages



// --- 1. Dashboard Layout (Global UI Elements) ---
interface DashboardLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const userRole = 'Admin'; // Hardcode role for now

  // Navigation Links for Admin
  const navLinks = [
    { to: '/admin', icon: HouseDoor, label: 'Dashboard' },
    { to: '/admin/upload-xlsx', icon: FileEarmarkSpreadsheet, label: 'Upload Excel' },
    { to: '/admin/intake-excel', icon: FileEarmarkSpreadsheet, label: 'Intake Excel' },
    { to: '/admin/team-performance', icon: People, label: 'Team Performance' },
    { to: '/admin/audit', icon: ClockHistory, label: 'Audit' },
    { to: '/admin/exports', icon: BoxArrowRight, label: 'Exports' },
    { to: '/admin/reports', icon: ClockHistory, label: 'Reports' },
    { to: '/admin/users', icon: People, label: 'Users' },
  ];

  const activeLinkClass = 'bg-teal-700/50 border-l-4 border-teal-500 text-white';
  const defaultLinkClass = 'text-gray-300 hover:bg-gray-700 hover:text-white border-l-4 border-transparent';

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`bg-gray-800 dark:bg-gray-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} shrink-0`}>
        <div className="p-4 text-2xl font-bold border-b border-gray-700 text-teal-500">
          {isSidebarOpen ? 'Admin Portal' : 'AP'}
        </div>
        <nav className="mt-5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              // Note: In a real app, use useLocation to check if link.to matches the current path
              className={`flex items-center py-3 px-4 text-sm font-medium ${
                // Quick way to highlight Users and Upload-XLSX page for demo
                (window.location.pathname === link.to) ? activeLinkClass : defaultLinkClass
              }`}
            >
              <link.icon className="shrink-0 w-6 h-6" />
              <span className={`ml-3 ${isSidebarOpen ? '' : 'hidden'}`}>{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 dark:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <div className="flex items-center space-x-4">
            {/* Business Hours Badge */}
            <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              Status: 
              <span className={`ml-2 w-3 h-3 rounded-full ${new Date().getHours() >= 9 && new Date().getHours() < 17 ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            {/* User Info */}
            <span className="text-gray-900 dark:text-white font-medium">{`Hello, Admin! (${userRole})`}</span>
            <button className="text-red-500 hover:text-red-700 dark:text-red-400">
              <BoxArrowRight className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <Router>
      <AdminLayout>
        <Routes>
          {/* Admin Routes */}
          {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/upload-xlsx" element={<UploadXlsxPage />} />
          <Route path="/admin/intake-excel" element={<IntakeExcel />} />
          <Route path="/admin/team-performance" element={<TeamPerformance />} />
          <Route path="/admin/audit" element={<AuditPage />} />
          <Route path="/admin/exports" element={<ExportPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />

          {/* Fallback/Home (Replace with Login page later) */}
          <Route path="/" element={<UsersPage />} />
        </Routes>
      </AdminLayout>
    </Router>
  );
};

export default App;