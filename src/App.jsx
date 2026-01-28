import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import MyLeads from './pages/MyLeads';
import TeamManagement from './pages/TeamManagement';
import UploadHistory from './pages/UploadHistory';
import AttendanceCalendar from './pages/AttendanceCalendar';
import LeadDetails from './pages/LeadDetails';
import RaiseTicket from './pages/RaiseTicket';
import AdminTicketDesk from './pages/AdminTicketDesk';
import AdminAttendance from './pages/AdminAttendance';
import TaskManager from './pages/TaskManager';
import AdminUpload from './pages/AdminUpload';
import LeadDistribution from './pages/LeadDistribution';
import LeadLifecycle from './pages/LeadLifecycle';
import ArchivedLeads from './pages/ArchivedLeads';
import MyLeave from './pages/MyLeave';

// HR Pages
import HrHeadcount from './pages/HrHeadcount';
import HrOrgChart from './pages/HrOrgChart';
import HrPayroll from './pages/HrPayroll';
import HrHolidayCalendar from './pages/HrHolidayCalendar';
import HrLeaveManagement from './pages/HrLeaveManagement';

// HR-only guard
import HrRoute from './components/HrRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Private Routes (Wrapped in Layout) */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/my-leads" element={<MyLeads />} />
          <Route path="/team" element={<TeamManagement />} />
          <Route path="/uploads" element={<UploadHistory />} />
          <Route path="/calendar" element={<AttendanceCalendar />} />
          <Route path="/lead-details" element={<LeadDetails />} />
          <Route path="/raise-ticket" element={<RaiseTicket />} />
          <Route path="/admin-tickets" element={<AdminTicketDesk />} />
          <Route path="/admin-attendance" element={<AdminAttendance />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="/admin-upload" element={<AdminUpload />} />
          <Route path="/distribute" element={<LeadDistribution />} />
          <Route path="/archive" element={<ArchivedLeads />} />
          <Route path="/lead-lifecycle/:id" element={<LeadLifecycle />} />

          {/* ✅ Employee Leave Requests */}
          <Route path="/leave" element={<MyLeave />} />

          {/* HR MODULE (HR ONLY) */}
          <Route
            path="/hr/headcount"
            element={
              <HrRoute>
                <HrHeadcount />
              </HrRoute>
            }
          />
          <Route
            path="/hr/org-chart"
            element={
              <HrRoute>
                <HrOrgChart />
              </HrRoute>
            }
          />
          <Route
            path="/hr/payroll"
            element={
              <HrRoute>
                <HrPayroll />
              </HrRoute>
            }
          />

          {/* ✅ HR Holiday Calendar */}
          <Route
            path="/hr/holidays"
            element={
              <HrRoute>
                <HrHolidayCalendar />
              </HrRoute>
            }
          />

          {/* ✅ HR Leave Management */}
          <Route
            path="/hr/leaves"
            element={
              <HrRoute>
                <HrLeaveManagement />
              </HrRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
