import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout'; // Import the new layout
import MyLeads from './pages/MyLeads';
import TeamManagement from './pages/TeamManagement';
import UploadHistory from './pages/UploadHistory';
import AttendanceCalendar from './pages/AttendanceCalendar';
import LeadDetails from './pages/LeadDetails';
import RaiseTicket from './pages/RaiseTicket';
import AdminTicketDesk from './pages/AdminTicketDesk';

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
        </Route>

      </Routes>
    </Router>
  );
}

export default App;