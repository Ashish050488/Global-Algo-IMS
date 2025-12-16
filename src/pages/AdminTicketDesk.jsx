import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Shield, Check, Clock } from 'lucide-react';

const AdminTicketDesk = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to load tickets");
    }
  };

  const markResolved = async (id) => {
    if(!window.confirm("Mark this issue as Resolved?")) return;
    try {
      await api.put(`/tickets/${id}/resolve`);
      fetchTickets();
    } catch (err) {
      alert("Error updating ticket");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-dark mb-6 flex items-center gap-2">
        <Shield /> Support Desk
      </h1>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Reported By</th>
              <th className="p-4">Issue</th>
              <th className="p-4">Category</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map(ticket => (
              <tr key={ticket._id} className="hover:bg-gray-50">
                <td className="p-4 text-xs text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <p className="font-bold text-sm text-gray-800">{ticket.createdBy?.name || "Unknown"}</p>
                  <p className="text-xs text-gray-400">{ticket.createdBy?.role}</p>
                </td>
                <td className="p-4 max-w-xs">
                  <p className="font-bold text-sm text-brand-dark">{ticket.subject}</p>
                  <p className="text-xs text-gray-500 truncate">{ticket.description}</p>
                </td>
                <td className="p-4 text-sm">{ticket.category}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    ticket.priority === 'High' ? 'bg-red-100 text-red-700' : 
                    ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-green-100 text-green-700'
                  }`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="p-4">
                   <span className={`flex items-center gap-1 text-xs font-bold ${
                     ticket.status === 'Resolved' ? 'text-green-600' : 'text-orange-500'
                   }`}>
                     {ticket.status === 'Resolved' ? <Check size={14}/> : <Clock size={14}/>}
                     {ticket.status}
                   </span>
                </td>
                <td className="p-4">
                  {ticket.status === 'Open' && (
                    <button 
                      onClick={() => markResolved(ticket._id)}
                      className="bg-brand-medium text-white px-3 py-1 rounded text-xs hover:bg-brand-dark transition"
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTicketDesk;