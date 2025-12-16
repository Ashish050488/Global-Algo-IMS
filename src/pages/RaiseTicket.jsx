import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { MessageSquare, AlertCircle, CheckCircle, Lock, Send } from 'lucide-react';

const RaiseTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    recipient: 'Admin', // Default
    category: 'IT Issue',
    priority: 'Medium',
    subject: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tickets/create', formData);
      alert("Ticket Sent Successfully");
      setFormData({ ...formData, subject: '', description: '' }); // Reset text fields
      fetchMyTickets();
    } catch (err) {
      alert("Failed to send ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* FORM SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-500">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <AlertCircle className="text-red-500" /> Raise a Ticket
        </h2>
        <p className="text-sm text-gray-500 mb-6 flex items-center gap-1">
          <Lock size={12} /> Confidential Submission
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* RECIPIENT SELECTOR (Only for Employees) */}
          {role === 'Employee' && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Send To</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="recipient" 
                    value="Admin"
                    checked={formData.recipient === 'Admin'}
                    onChange={e => setFormData({...formData, recipient: e.target.value})}
                    className="accent-red-600"
                  />
                  <span className="text-sm font-medium">Admin (Head Office)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="recipient" 
                    value="BranchManager"
                    checked={formData.recipient === 'BranchManager'}
                    onChange={e => setFormData({...formData, recipient: e.target.value})}
                    className="accent-brand-medium"
                  />
                  <span className="text-sm font-medium">Branch Manager</span>
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
              <select 
                className="w-full p-2 border rounded"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>IT Issue</option>
                <option>Complaint</option>
                <option>Harassment</option>
                <option>Suggestion</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Priority</label>
              <select 
                className="w-full p-2 border rounded"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Subject</label>
            <input 
              type="text" 
              required
              className="w-full p-2 border rounded"
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
            <textarea 
              required
              rows="4"
              className="w-full p-2 border rounded"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition flex justify-center items-center gap-2"
          >
            <Send size={16} />
            {loading ? 'Sending...' : 'Submit Ticket'}
          </button>
        </form>
      </div>

      {/* HISTORY SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-gray-400">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <MessageSquare /> My Sent Tickets
        </h2>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {tickets.length === 0 ? (
            <p className="text-gray-400 text-center">No tickets raised yet.</p>
          ) : (
            tickets.map(ticket => (
              <div key={ticket._id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                    To: {ticket.recipient}
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-bold ${ticket.status === 'Resolved' ? 'text-green-600' : 'text-orange-500'}`}>
                    {ticket.status === 'Resolved' ? <CheckCircle size={12}/> : <AlertCircle size={12}/>}
                    {ticket.status}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800">{ticket.subject}</h3>
                <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(ticket.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default RaiseTicket;